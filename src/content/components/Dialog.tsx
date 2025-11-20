import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { css } from '@emotion/css';
import { Storage } from '../../shared/storage';
import type { DialogPosition, Message, ContentMessage } from '../../shared/types';
import { buildPageContext } from '../../shared/utils';
import InputArea from './InputArea';
import Response from './Response';
import ContextToggle from './ContextToggle';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose }) => {
  // Initialize position centered on viewport
  const [position, setPosition] = useState(() => {
    const centerX = Math.max(0, (window.innerWidth - 800) / 2);
    const centerY = Math.max(0, (window.innerHeight - 400) / 2);
    console.log('[FireClaude] Initial dialog position:', { centerX, centerY, scrollY: window.scrollY, innerHeight: window.innerHeight });
    return { x: centerX, y: centerY };
  });
  const [size, setSize] = useState({ width: 800, height: 400 });
  const [maxDimensions, setMaxDimensions] = useState(() => ({
    maxWidth: window.innerWidth - 40,
    maxHeight: window.innerHeight - 40,
  }));
  const [inputValue, setInputValue] = useState('');
  const [contextEnabled, setContextEnabled] = useState(false);
  const [contextMode, setContextMode] = useState<'none' | 'selection' | 'fullpage'>('none');
  const [capturedSelection, setCapturedSelection] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

  // Capture text selection and auto-enable context when dialog opens
  useEffect(() => {
    if (isOpen) {
      const selection = window.getSelection();
      const selectionText = selection && selection.toString().trim();
      if (selectionText && selectionText.length > 0) {
        setCapturedSelection(selectionText);
        setContextEnabled(true);
        setContextMode('selection');
        console.log('[FireClaude] Auto-enabled context with selection:', selectionText.length, 'chars');
      } else {
        setCapturedSelection(null);
        setContextMode('none');
      }
    } else {
      // Reset when dialog closes
      setCapturedSelection(null);
      setContextMode('none');
      setContextEnabled(false);
    }
  }, [isOpen]);

  // Load saved position on mount (if exists)
  useEffect(() => {
    Storage.getDialogPosition().then((saved) => {
      if (saved) {
        setPosition({ x: saved.x, y: saved.y });
        setSize({ width: saved.width, height: saved.height });
      }
    });
  }, []);

  // Update max dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setMaxDimensions({
        maxWidth: window.innerWidth - 40,
        maxHeight: window.innerHeight - 40,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Esc to cancel generation
  useEffect(() => {
    if (!isLoading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        // Stop generation
        setIsLoading(false);
        chrome.runtime.sendMessage({ type: 'cancelStream' });
        console.log('[FireClaude] Generation cancelled by user');
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isLoading]);

  // Save position when changed
  const handleDragStop = (_e: any, d: { x: number; y: number }) => {
    const newPos: DialogPosition = { x: d.x, y: d.y, width: size.width, height: size.height };
    setPosition({ x: d.x, y: d.y });
    Storage.saveDialogPosition(newPos);
  };

  const handleResizeStop = (_e: any, _direction: any, ref: HTMLElement, _delta: any, position: { x: number; y: number }) => {
    const newPos: DialogPosition = {
      x: position.x,
      y: position.y,
      width: parseInt(ref.style.width),
      height: parseInt(ref.style.height),
    };
    setPosition({ x: position.x, y: position.y });
    setSize({ width: newPos.width, height: newPos.height });
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
      if (confirm('Clear entire conversation?')) {
        setConversationHistory([]);
        setResponse('');
        setError(null);
      }
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

      // Check if API key is set
      if (!settings.apiKey || settings.apiKey.trim() === '') {
        setError('No API key configured. Click the settings icon (⚙️) to add your Anthropic API key.');
        setIsLoading(false);
        return;
      }

      // Build context based on mode
      let context = undefined;
      if (contextEnabled && contextMode !== 'none') {
        if (contextMode === 'selection' && capturedSelection) {
          // Use captured selection
          context = {
            url: window.location.href,
            title: document.title,
            selection: capturedSelection,
            metadata: undefined,
          };
        } else if (contextMode === 'fullpage') {
          // Use full page context
          context = buildPageContext({
            includeScripts: settings.includeScripts,
            includeStyles: settings.includeStyles,
            includeAltText: settings.includeAltText,
            maxLength: settings.contextMaxLength,
          });
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
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

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
          size={size}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          minWidth={400}
          minHeight={200}
          maxWidth={maxDimensions.maxWidth}
          maxHeight={maxDimensions.maxHeight}
          bounds="parent"
          dragHandleClassName="drag-handle"
          className={dialogStyles}
        >
        {/* Header */}
        <div className={`${headerStyles} drag-handle`}>
          <h2>
            <img src={chrome.runtime.getURL('icons/icon-48.png')} alt="" className={iconStyles} />
            FireClaude
          </h2>
          <div className={headerButtonsStyles}>
            {conversationHistory.length > 0 && (
              <button onClick={handleClearConversation} aria-label="Clear conversation" title="Clear conversation">
                🗑
              </button>
            )}
            <button onClick={() => chrome.runtime.sendMessage({ type: 'openSettings' })} aria-label="Settings" title="Open Settings">
              ⚙️
            </button>
            <button onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={contentWrapperStyles}>
          {/* Response Area */}
          <Response
            conversationHistory={conversationHistory}
            currentResponse={response}
            isLoading={isLoading}
            error={error}
          />

          {/* Input Area */}
          <div className={inputSectionStyles}>
            {!isLoading ? (
              <>
                <ContextToggle
                  enabled={contextEnabled}
                  mode={contextMode}
                  selectionLength={capturedSelection?.length}
                  onToggle={handleContextToggle}
                />
                <InputArea
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={handleSubmit}
                  disabled={isLoading}
                />
              </>
            ) : (
              <div className={cancelHintStyles}>
                Press <strong>Esc</strong> to stop generating
              </div>
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
  background: rgba(0, 0, 0, 0.3);
  z-index: 999998;
`;

const dialogStyles = css`
  position: absolute !important;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const headerStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const iconStyles = css`
  width: 24px;
  height: 24px;
`;

const headerButtonsStyles = css`
  display: flex;
  gap: 4px;

  button {
    background: none;
    border: none;
    font-size: 20px;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      background: #f0f0f0;
      color: #333;
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
  border-top: 1px solid #e0e0e0;
  padding: 12px;
  background: #f9f9f9;
`;

const cancelHintStyles = css`
  text-align: center;
  padding: 16px;
  color: #666;
  font-size: 14px;
  background: #f0f0f0;
  border-radius: 6px;

  strong {
    color: #333;
    font-weight: 600;
  }
`;

export default Dialog;
