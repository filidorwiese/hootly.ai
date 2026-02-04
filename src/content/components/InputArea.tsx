import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { css } from '@emotion/css';
import ContextToggle from './ContextToggle';
import PersonaSelector from './PersonaSelector';
import ModelSelector from './ModelSelector';
import { t } from '../../shared/i18n';
import { getLocalizedPromptText } from '../../shared/i18n';
import { SendIcon, ClearIcon } from '../../shared/icons';
import type { LLMProvider, Persona, SavedPrompt } from '../../shared/types';
import { DEFAULT_PROMPTS } from '../../shared/types';
import type { ModelConfig } from '../../shared/models';
import { radii, fontSizes, transitions, spacing } from '../../shared/styles';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  contextEnabled: boolean;
  contextMode: 'none' | 'selection' | 'fullpage' | 'clipboard';
  selectionLength?: number;
  clipboardLength?: number;
  onContextToggle: () => void;
  modelId?: string;
  provider?: LLMProvider;
  personas?: Persona[];
  selectedPersonaId?: string;
  onSelectPersona?: (persona: Persona) => void;
  models?: ModelConfig[];
  onSelectModel?: (modelId: string) => void;
  isLoadingModels?: boolean;
  hideContext?: boolean;
  customPrompts?: SavedPrompt[];
}

const InputArea: React.FC<InputAreaProps> = ({
  value, onChange, onSubmit, disabled,
  contextEnabled, contextMode, selectionLength, clipboardLength, onContextToggle, modelId, provider,
  personas, selectedPersonaId, onSelectPersona,
  models, onSelectModel, isLoadingModels, hideContext,
  customPrompts = []
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24; // approximate
      const minHeight = lineHeight * 2;
      const maxHeight = lineHeight * 6;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  }, [value]);

  // Get localized prompt text
  const getPromptText = useCallback((prompt: SavedPrompt): string => {
    if (prompt.isBuiltIn) {
      return getLocalizedPromptText(prompt.id) || prompt.text;
    }
    return prompt.text;
  }, []);

  // Find autocomplete match
  const autocompleteMatch = useMemo(() => {
    if (!value.trim()) return null;

    const allPrompts = [...DEFAULT_PROMPTS, ...customPrompts];
    const lowerValue = value.toLowerCase();

    for (const prompt of allPrompts) {
      const promptText = getPromptText(prompt);
      if (promptText.toLowerCase().startsWith(lowerValue) && promptText.toLowerCase() !== lowerValue) {
        return promptText;
      }
    }
    return null;
  }, [value, customPrompts, getPromptText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab to accept autocomplete
    if (e.key === 'Tab' && autocompleteMatch) {
      e.preventDefault();
      onChange(autocompleteMatch);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(autocompleteMatch.length, autocompleteMatch.length);
        }
      }, 0);
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={containerStyles}>
      <div className={textareaWrapperStyles}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('input.placeholder')}
          disabled={disabled}
          className={textareaStyles}
        />
        {autocompleteMatch && (
          <div className={ghostTextStyles}>
            <span className={ghostTextHiddenStyles}>{value}</span>
            <span className={ghostTextVisibleStyles}>{autocompleteMatch.slice(value.length)}</span>
          </div>
        )}
        {value && !disabled && (
          <>
            <button
                onClick={onSubmit}
                className={sendIconStyles}
                aria-label={t('input.send')}
                type="button"
            >
              <SendIcon size={24} />
            </button>
            <button
                onClick={() => onChange('')}
                className={clearIconStyles}
                aria-label={t('input.clear')}
                type="button"
            >
              <ClearIcon size={24} />
            </button>
          </>
        )}
      </div>
      <div className={footerStyles}>
        <div className={footerLeftStyles}>
          {!hideContext && (
            <ContextToggle
              enabled={contextEnabled}
              mode={contextMode}
              selectionLength={selectionLength}
              clipboardLength={clipboardLength}
              onToggle={onContextToggle}
            />
          )}
          {personas && selectedPersonaId && onSelectPersona && (
            <PersonaSelector
              personas={personas}
              selectedPersonaId={selectedPersonaId}
              onSelectPersona={onSelectPersona}
            />
          )}
        </div>
        {models && modelId && provider && onSelectModel && (
          <ModelSelector
            models={models}
            selectedModelId={modelId}
            provider={provider}
            onSelectModel={onSelectModel}
            isLoading={isLoadingModels}
          />
        )}
      </div>
    </div>
  );
};

const containerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const textareaWrapperStyles = css`
  position: relative;
  display: flex;
  align-items: flex-start;
`;

const textareaStyles = css`
  width: 100%;
  padding: ${spacing[3]} 70px ${spacing[3]} ${spacing[3]};
  border: 1px solid var(--color-border-default);
  border-radius: ${radii.xl};
  font-size: ${fontSizes.md};
  font-family: 'Inter', sans-serif;
  resize: none;
  line-height: 1.55;
  box-sizing: border-box;
  outline: none;
  background: var(--color-surface-default);
  color: var(--color-text-primary);
  transition: border-color ${transitions.default};

  &:focus {
  }

  &:disabled {
    background: var(--color-surface-disabled);
    cursor: not-allowed;
    color: var(--color-text-secondary);
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

const sendIconStyles = css`
  position: absolute;
  right: 40px;
  top: 10px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: ${radii.full};
  cursor: pointer;
  transition: opacity ${transitions.default}, transform ${transitions.default};
  padding: 0;

  &:hover {
    opacity: 0.8;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const clearIconStyles = css`
  position: absolute;
  right: 10px;
  top: 10px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: ${radii.full};
  cursor: pointer;
  transition: opacity ${transitions.default}, transform ${transitions.default};
  padding: 0;

  &:hover {
    opacity: 0.7;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const footerStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const footerLeftStyles = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ghostTextStyles = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 70px;
  padding: ${spacing[3]};
  font-size: ${fontSizes.md};
  font-family: 'Inter', sans-serif;
  line-height: 1.55;
  pointer-events: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
`;

const ghostTextHiddenStyles = css`
  visibility: hidden;
`;

const ghostTextVisibleStyles = css`
  color: var(--color-text-tertiary);
`;

export default InputArea;
