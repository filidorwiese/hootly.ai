import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { css } from '@emotion/css';
import { Storage } from '../../shared/storage';
import type { DialogPosition, Message, ContentMessage, LLMProvider, Persona, Conversation } from '../../shared/types';
import type { ModelConfig } from '../../shared/models';
import { DEFAULT_PERSONAS } from '../../shared/types';
import { extractSelection, extractPageText, getPageUrl, getPageTitle, requestPageInfo } from '../../shared/utils';
import { getApiKey } from '../../shared/providers';
import { t } from '../../shared/i18n';
import { radii, spacing, fontSizes, fontWeights, transitions } from '../../shared/styles';
import { FireIcon, HistoryIcon, SettingsIcon, CloseIcon } from '../../shared/icons';
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
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [currentPersonaId, setCurrentPersonaId] = useState<string>('general');
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Generate title from first user message (truncate to ~50 chars)
  const generateTitle = (message: string): string => {
    const trimmed = message.trim();
    if (trimmed.length <= 50) return trimmed;
    return trimmed.slice(0, 47) + '...';
  };

  // Generate UUID for conversation
  const generateId = (): string => {
    return crypto.randomUUID();
  };

  // Save conversation to storage
  const saveConversationToStorage = async (messages: Message[], convId: string, personaId: string, modelId: string) => {
    const existing = await Storage.getConversations();
    const existingConv = existing.find((c) => c.id === convId);

    const firstUserMessage = messages.find((m) => m.role === 'user');
    const title = existingConv?.title || (firstUserMessage ? generateTitle(firstUserMessage.content) : 'New Conversation');

    const conversation: Conversation = {
      id: convId,
      title,
      createdAt: existingConv?.createdAt || Date.now(),
      updatedAt: Date.now(),
      messages,
      personaId,
      modelId,
    };

    await Storage.saveConversation(conversation);
    await Storage.setCurrentConversation(conversation);
  };

  // Fetch available models from background
  const fetchModels = async () => {
    setIsLoadingModels(true);
    try {
      const response = await chrome.runtime.sendMessage({ type: 'fetchModels' });
      if (response?.success && response.models) {
        setModels(response.models);
      }
    } catch (err) {
      // Silently fail - models list will just be empty
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Capture text selection and auto-enable context when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Load current model, provider, and personas
      Storage.getSettings().then((settings) => {
        setCurrentModel(settings.model || '');
        setCurrentProvider(settings.provider || 'claude');
        const allPersonas = [...DEFAULT_PERSONAS, ...(settings.customPersonas || [])];
        setPersonas(allPersonas);
        if (!currentConversationId) {
          setCurrentPersonaId(settings.defaultPersonaId || 'general');
        }
        // Clean up old conversations based on retentionDays setting
        if (settings.retentionDays > 0) {
          Storage.clearOldConversations(settings.retentionDays);
        }
        // Fetch models if API key is set
        const apiKey = getApiKey(settings);
        if (apiKey) {
          fetchModels();
        }
      });
      // Request fresh page info from parent (for iframe mode)
      requestPageInfo().then(() => {
        const selectionText = extractSelection();
        if (selectionText && selectionText.length > 0) {
          setCapturedSelection(selectionText);
          setContextEnabled(true);
          setContextMode('selection');
          // console.log('[Hootly] Auto-enabled context with selection:', selectionText.length, 'chars');
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
          setModels([]); // Clear models when provider changes
          setConversationHistory([]);
          setCurrentConversationId(null);
          setResponse('');
          setError(null);
          // Refetch models for new provider
          fetchModels();
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
          // console.log('[Hootly] Generation cancelled by user');
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
    const handleMessage = async (message: ContentMessage) => {
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

        // Get current state values via refs/state updater
        setConversationHistory((prev) => {
          const newHistory = [...prev, assistantMessage];

          // Save to storage (async, but don't block state update)
          const convId = currentConversationId || generateId();
          if (!currentConversationId) {
            setCurrentConversationId(convId);
          }
          saveConversationToStorage(newHistory, convId, currentPersonaId, currentModel);

          return newHistory;
        });

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
  }, [currentConversationId, currentPersonaId, currentModel]);

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

  const handleClearConversation = async () => {
    if (conversationHistory.length > 0) {
      // Delete from storage if we have a conversation ID (burn functionality)
      if (currentConversationId) {
        await Storage.deleteConversation(currentConversationId);
        await Storage.setCurrentConversation(null);
      }
      setConversationHistory([]);
      setCurrentConversationId(null);
      setResponse('');
      setError(null);
      // Reset to default persona
      Storage.getSettings().then((settings) => {
        setCurrentPersonaId(settings.defaultPersonaId || 'general');
      });
    }
  };

  const handlePersonaSelect = (persona: Persona) => {
    setCurrentPersonaId(persona.id);
  };

  const handleModelSelect = async (modelId: string) => {
    setCurrentModel(modelId);
    // Save to settings so it persists
    await Storage.saveSettings({ model: modelId });
  };

  const handleOpenHistory = () => {
    // Open history page in a new tab
    chrome.runtime.sendMessage({ type: 'openHistory' });
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

      // Check if model is selected (use current state which may differ from settings)
      if (!currentModel || currentModel.trim() === '') {
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

      // Get current persona's system prompt
      const currentPersona = personas.find((p) => p.id === currentPersonaId);
      const personaSystemPrompt = currentPersona?.systemPrompt || '';

      // Combine persona prompt with user's custom system prompt
      let combinedSystemPrompt = personaSystemPrompt;
      if (settings.systemPrompt) {
        combinedSystemPrompt = personaSystemPrompt
          ? `${personaSystemPrompt}\n\n${settings.systemPrompt}`
          : settings.systemPrompt;
      }

      // Send to background worker with combined system prompt and current model
      await chrome.runtime.sendMessage({
        type: 'sendPrompt',
        payload: {
          prompt: currentInput,
          context,
          conversationHistory,
          settings: { ...settings, model: currentModel, systemPrompt: combinedSystemPrompt },
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
      window.parent.postMessage({ type: 'hootly-dialog-closed' }, '*');
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
          <div className={headerLeftStyles}>
            <h2>
              <img src={chrome.runtime.getURL('icons/icon-48.png')} alt="" className={iconStyles} />
              Hootly.ai <span className={taglineStyles}>- Your wise web companion</span>
            </h2>
          </div>
          <div className={headerButtonsStyles}>
            {conversationHistory.length > 0 && (
              <button onClick={handleClearConversation} aria-label={t('dialog.clearConversation')} title={t('dialog.clearConversation')}>
                <FireIcon size={18} />
              </button>
            )}
            <button onClick={handleOpenHistory} aria-label={t('history.openHistory')} title={t('history.openHistory')}>
              <HistoryIcon size={18} />
            </button>
            <button onClick={() => chrome.runtime.sendMessage({ type: 'openSettings' })} aria-label={t('dialog.settings')} title={t('dialog.openSettings')}>
              <SettingsIcon size={18} />
            </button>
            <button onClick={onClose} aria-label={t('dialog.close')}>
              <CloseIcon size={18} />
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
                modelId={currentModel}
                provider={currentProvider}
                personas={personas}
                selectedPersonaId={currentPersonaId}
                onSelectPersona={handlePersonaSelect}
                models={models}
                onSelectModel={handleModelSelect}
                isLoadingModels={isLoadingModels}
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
  background: rgba(20, 32, 25, 0.35);
  z-index: 999998;
`;

const dialogStyles = css`
  position: absolute !important;
  background: var(--color-bg-base);
  border-radius: ${radii['3xl']};
  border: 1px solid var(--color-border-default);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  overflow: visible;
`;

const headerStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing[3]} ${spacing[4]};
  background: var(--color-bg-muted);
  border-bottom: 1px solid var(--color-border-light);
  border-radius: ${radii['3xl']} ${radii['3xl']} 0 0;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  h2 {
    margin: 0;
    font-size: ${fontSizes.lg};
    font-weight: ${fontWeights.semibold};
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: ${spacing[2]};
    letter-spacing: -0.01em;
  }
`;

const iconStyles = css`
  width: 26px;
  height: 26px;
`;

const taglineStyles = css`
  font-weight: ${fontWeights.normal};
  color: var(--color-text-tertiary);
`;

const headerLeftStyles = css`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const headerButtonsStyles = css`
  display: flex;
  gap: ${spacing[1]};

  button {
    background: transparent;
    border: none;
    font-size: ${fontSizes.xl};
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${radii.lg};
    transition: background ${transitions.default}, color ${transitions.default};

    &:hover {
      background: var(--color-surface-hover);
      color: var(--color-primary-500);
    }

    &:active {
      background: var(--color-surface-active);
    }
  }
`;

const contentWrapperStyles = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
`;

const inputSectionStyles = css`
  border-top: 1px solid var(--color-border-light);
  padding: ${spacing[3]} ${spacing[4]};
  background: var(--color-bg-muted);
  border-radius: 0 0 ${radii['3xl']} ${radii['3xl']};
`;

const cancelHintStyles = css`
  text-align: center;
  padding: ${spacing[4]};
  color: var(--color-text-secondary);
  font-size: ${fontSizes.md};
  background: var(--color-bg-subtle);
  border-radius: ${radii.xl};
  border: 1px solid var(--color-border-light);

  strong {
    color: var(--color-primary-500);
    font-weight: ${fontWeights.semibold};
  }
`;

export default Dialog;
