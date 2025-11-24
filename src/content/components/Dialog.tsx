import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { css } from '@emotion/css';
import { Storage } from '../../shared/storage';
import type { DialogPosition, Message, ContentMessage, LLMProvider } from '../../shared/types';
import { extractSelection, extractPageText, getPageUrl, getPageTitle, requestPageInfo } from '../../shared/utils';
import { getApiKey } from '../../shared/providers';
import { t } from '../../shared/i18n';
import InputArea from './InputArea';
import Response from './Response';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose }) => {
  // Initialize position: centered horizontally, 60px from top
  const [position, setPosition] = useState(() => {
    const centerX = Math.max(0, (window.innerWidth - 800) / 2);
    return { x: centerX, y: 60 };
  });
  const [size, setSize] = useState({ width: 800 });
  const [maxDimensions, setMaxDimensions] = useState(() => ({
    maxWidth: window.innerWidth - 40,
  }));
  const [inputValue, setInputValue] = useState('');
  const [contextEnabled, setContextEnabled] = useState(false);
  const [contextMode, setContextMode] = useState<'none' | 'selection' | 'fullpage'>('none');
  const [capturedSelection, setCapturedSelection] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [currentProvider, setCurrentProvider] = useState<LLMProvider>('claude');

  // Estimate token count (rough approximation: ~4 chars per token)
  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  const getCurrentTokenCount = (): number => {
    let count = estimateTokens(inputValue);

    if (contextEnabled && contextMode === 'selection' && capturedSelection) {
      count += estimateTokens(capturedSelection);
    } else if (contextEnabled && contextMode === 'fullpage') {
      const pageText = extractPageText({ includeScripts: false, includeStyles: false, maxLength: 50000 });
      count += estimateTokens(pageText);
    }

    return count;
  };

  // Capture text selection and auto-enable context when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Load current model and provider
      Storage.getSettings().then((settings) => {
        setCurrentModel(settings.model || '');
        setCurrentProvider(settings.provider || 'claude');
      });
      // Request fresh page info from parent (for iframe mode)
      requestPageInfo().then(() => {
        const selectionText = extractSelection();
        if (selectionText && selectionText.length > 0) {
          setCapturedSelection(selectionText);
          setContextEnabled(true);
          setContextMode('selection');
          console.log('[FireOwl] Auto-enabled context with selection:', selectionText.length, 'chars');
        } else {
          setCapturedSelection(null);
          setContextMode('none');
        }
      });
    } else {
      // Reset when dialog closes
      setCapturedSelection(null);
      setContextMode('none');
      setContextEnabled(false);
    }
  }, [isOpen]);

  // Load saved width on mount, but always reset position when opening
  useEffect(() => {
    Storage.getDialogPosition().then((saved) => {
      if (saved) {
        setSize({ width: saved.width });
      }
    });
  }, []);

  // Reset position when dialog opens: centered horizontally, 60px from top
  useEffect(() => {
    if (isOpen) {
      const width = size.width;
      const centerX = Math.max(0, (window.innerWidth - width) / 2);
      setPosition({ x: centerX, y: 60 });
    }
  }, [isOpen]);

  // Listen for provider changes and clear conversation
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.settings?.newValue?.provider !== changes.settings?.oldValue?.provider) {
        const newProvider = changes.settings?.newValue?.provider;
        if (newProvider && newProvider !== currentProvider) {
          setCurrentProvider(newProvider);
          setCurrentModel(changes.settings?.newValue?.model || '');
          setConversationHistory([]);
          setResponse('');
          setError(null);
          console.log('[FireOwl] Provider changed to:', newProvider, '- conversation cleared');
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [currentProvider]);

  // Update max dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setMaxDimensions({
        maxWidth: window.innerWidth - 40,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Esc: cancel generation if loading, otherwise close dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (isLoading) {
          // Stop generation
          setIsLoading(false);
          chrome.runtime.sendMessage({ type: 'cancelStream' });
          console.log('[FireOwl] Generation cancelled by user');
        } else {
          // Close dialog
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, isLoading, onClose]);

  // Save position when changed
  const handleDragStop = (_e: any, d: { x: number; y: number }) => {
    const newPos: DialogPosition = { x: d.x, y: d.y, width: size.width, height: 0 };
    setPosition({ x: d.x, y: d.y });
    Storage.saveDialogPosition(newPos);
  };

  const handleResizeStop = (_e: any, _direction: any, ref: HTMLElement, _delta: any, position: { x: number; y: number }) => {
    const newPos: DialogPosition = {
      x: position.x,
      y: position.y,
      width: parseInt(ref.style.width),
      height: 0,
    };
    setPosition({ x: position.x, y: position.y });
    setSize({ width: newPos.width });
    Storage.saveDialogPosition(newPos);
  };

  // Listen for streaming responses from background
  useEffect(() => {
    const handleMessage = (message: ContentMessage) => {
      if (message.type === 'streamChunk') {
        setResponse((prev) => prev + message.payload.content);
      } else if (message.type === 'streamEnd') {
        setIsLoading(false);
        // Save completed exchange to history with the final content
        const assistantMessage: Message = {
          role: 'assistant',
          content: message.payload.content,
          timestamp: Date.now(),
        };
        setConversationHistory((prev) => [...prev, assistantMessage]);
        // Clear current response to avoid duplication
        setResponse('');
      } else if (message.type === 'streamError') {
        setIsLoading(false);
        setError(message.payload.error);
      } else if (message.type === 'modelNotFound') {
        setIsLoading(false);
        setError(t('dialog.modelNotFound'));
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const handleContextToggle = () => {
    if (!contextEnabled) {
      // Enable context
      if (capturedSelection) {
        setContextMode('selection');
      } else {
        setContextMode('fullpage');
      }
      setContextEnabled(true);
    } else {
      // Cycle through modes or disable
      if (contextMode === 'selection') {
        // Switch to fullpage
        setContextMode('fullpage');
      } else if (contextMode === 'fullpage') {
        // Disable context
        setContextEnabled(false);
        setContextMode('none');
      }
    }
  };

  const handleClearConversation = () => {
    if (conversationHistory.length > 0) {
      setConversationHistory([]);
      setResponse('');
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    // Store the current input value before clearing
    const currentInput = inputValue;
    setInputValue('');

    try {
      const settings = await Storage.getSettings();

      // Check if API key is set for current provider
      const apiKey = getApiKey(settings);
      if (!apiKey || apiKey.trim() === '') {
        setError(t('dialog.noApiKey'));
        setIsLoading(false);
        return;
      }

      // Check if model is selected
      if (!settings.model || settings.model.trim() === '') {
        setError(t('dialog.noModelSelected'));
        setIsLoading(false);
        return;
      }

      // Build context based on mode
      let context = undefined;
      if (contextEnabled && contextMode !== 'none') {
        // Refresh page info for accurate context
        await requestPageInfo();

        if (contextMode === 'selection' && capturedSelection) {
          // Use captured selection
          context = {
            url: getPageUrl(),
            title: getPageTitle(),
            selection: capturedSelection,
            metadata: undefined,
          };
        } else if (contextMode === 'fullpage') {
          // Use full page context (ignore any selection)
          context = {
            url: getPageUrl(),
            title: getPageTitle(),
            fullPage: extractPageText({
              includeScripts: settings.includeScripts,
              includeStyles: settings.includeStyles,
              maxLength: settings.contextMaxLength,
            }),
            metadata: undefined,
          };
        }
      }

      // Add user message to history
      const userMessage: Message = {
        role: 'user',
        content: currentInput,
        timestamp: Date.now(),
        context,
      };

      setConversationHistory((prev) => [...prev, userMessage]);

      // Send to background worker
      await chrome.runtime.sendMessage({
        type: 'sendPrompt',
        payload: {
          prompt: currentInput,
          context,
          conversationHistory,
          settings,
        },
      });
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : t('dialog.sendFailed'));
    }
  };

  // Notify parent window when dialog closes
  useEffect(() => {
    if (!isOpen) {
      window.parent.postMessage({ type: 'fireowl-dialog-closed' }, '*');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={backdropStyles} onClick={onClose} />

      {/* Fixed container for dialog */}
      <div className={fixedContainerStyles}>
        {/* Draggable/Resizable Dialog */}
        <Rnd
          position={position}
          size={{
            width: size.width,
            height: 'auto',
          }}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          minWidth={400}
          maxWidth={maxDimensions.maxWidth}
          bounds="parent"
          dragHandleClassName="drag-handle"
          className={dialogStyles}
          enableResizing={{ left: true, right: true, topLeft: true, topRight: true, bottomLeft: true, bottomRight: true, top: false, bottom: false }}
        >
        {/* Header */}
        <div className={`${headerStyles} drag-handle`}>
          <h2>
            <img src={chrome.runtime.getURL('icons/icon-48.png')} alt="" className={iconStyles} />
            FireOwl <span className={taglineStyles}>- Your wise web companion</span>
          </h2>
          <div className={headerButtonsStyles}>
            {conversationHistory.length > 0 && (
              <button onClick={handleClearConversation} aria-label={t('dialog.clearConversation')} title={t('dialog.clearConversation')}>🔥</button>
            )}
            <button onClick={() => chrome.runtime.sendMessage({ type: 'openSettings' })} aria-label={t('dialog.settings')} title={t('dialog.openSettings')}>
              ⚙️
            </button>
            <button onClick={onClose} aria-label={t('dialog.close')}>
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={contentWrapperStyles}>
          {/* Response Area - only shown when there's content */}
          {(conversationHistory.length > 0 || response || isLoading || error) && (
            <Response
              conversationHistory={conversationHistory}
              currentResponse={response}
              isLoading={isLoading}
              error={error}
            />
          )}

          {/* Input Area */}
          <div className={inputSectionStyles}>
            {!isLoading ? (
              <InputArea
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                disabled={isLoading}
                contextEnabled={contextEnabled}
                contextMode={contextMode}
                selectionLength={capturedSelection?.length}
                onContextToggle={handleContextToggle}
                tokenCount={getCurrentTokenCount()}
                modelId={currentModel}
                provider={currentProvider}
              />
            ) : (
              <div className={cancelHintStyles} dangerouslySetInnerHTML={{ __html: t('dialog.cancelHint') }} />
            )}
          </div>
        </div>
      </Rnd>
      </div>
    </>
  );
};

const fixedContainerStyles = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 999999;

  > div {
    pointer-events: auto;
  }
`;

const backdropStyles = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 40, 32, 0.4);
  backdrop-filter: blur(2px);
  z-index: 999998;
`;

const dialogStyles = css`
  position: absolute !important;
  background: #FAFBF9;
  border-radius: 16px;
  box-shadow:
    0 4px 6px rgba(45, 60, 48, 0.04),
    0 12px 28px rgba(45, 60, 48, 0.12),
    0 0 0 1px rgba(45, 60, 48, 0.06);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
`;

const headerStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: linear-gradient(to bottom, #F5F7F4, #FAFBF9);
  border-bottom: 1px solid #E4E8E2;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #2D3A30;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.01em;
  }
`;

const iconStyles = css`
  width: 26px;
  height: 26px;
`;

const taglineStyles = css`
  font-weight: 400;
  color: #8A9A8C;
`;

const headerButtonsStyles = css`
  display: flex;
  gap: 2px;

  button {
    background: transparent;
    border: none;
    font-size: 16px;
    color: #6B7A6E;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.15s ease;

    &:hover {
      background: rgba(58, 90, 64, 0.08);
      color: #3A5A40;
    }

    &:active {
      transform: scale(0.95);
    }
  }
`;

const contentWrapperStyles = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const inputSectionStyles = css`
  border-top: 1px solid #E4E8E2;
  padding: 14px 16px;
  background: #F5F7F4;
`;

const cancelHintStyles = css`
  text-align: center;
  padding: 18px;
  color: #6B7A6E;
  font-size: 13px;
  background: #EEF1EC;
  border-radius: 10px;

  strong {
    color: #3A5A40;
    font-weight: 600;
  }
`;

export default Dialog;
