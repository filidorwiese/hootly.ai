import React, { useRef, useEffect, useState, useCallback } from 'react';
import { css } from '@emotion/css';
import ContextToggle from './ContextToggle';
import PersonaSelector from './PersonaSelector';
import ModelSelector from './ModelSelector';
import PromptSelector from './PromptSelector';
import { t } from '../../shared/i18n';
import { SendIcon, ClearIcon } from '../../shared/icons';
import type { LLMProvider, Persona, SavedPrompt } from '../../shared/types';
import type { ModelConfig } from '../../shared/models';
import { radii, fontSizes, transitions, spacing } from '../../shared/styles';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  contextEnabled: boolean;
  contextMode: 'none' | 'selection' | 'fullpage';
  selectionLength?: number;
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
  onSlashModeChange?: (isActive: boolean) => void;
  customPrompts?: SavedPrompt[];
}

const InputArea: React.FC<InputAreaProps> = ({
  value, onChange, onSubmit, disabled,
  contextEnabled, contextMode, selectionLength, onContextToggle, modelId, provider,
  personas, selectedPersonaId, onSelectPersona,
  models, onSelectModel, isLoadingModels, hideContext, onSlashModeChange,
  customPrompts = []
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [slashMode, setSlashMode] = useState(false);

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

  // Detect slash mode: value starts with '/'
  useEffect(() => {
    const isSlashActive = value.startsWith('/');
    if (isSlashActive !== slashMode) {
      setSlashMode(isSlashActive);
      onSlashModeChange?.(isSlashActive);
    }
  }, [value, slashMode, onSlashModeChange]);

  const closeSlashMode = useCallback(() => {
    setSlashMode(false);
    onSlashModeChange?.(false);
  }, [onSlashModeChange]);

  const handlePromptSelect = useCallback((text: string) => {
    onChange(text);
    closeSlashMode();
    // Focus textarea and move cursor to end
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(text.length, text.length);
      }
    }, 0);
  }, [onChange, closeSlashMode]);

  const handlePromptSelectorClose = useCallback(() => {
    onChange('');
    closeSlashMode();
    textareaRef.current?.focus();
  }, [onChange, closeSlashMode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Backspace while in slash mode with only '/' - close selector and clear
    if (e.key === 'Backspace' && slashMode && value === '/') {
      e.preventDefault();
      onChange('');
      closeSlashMode();
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      // Don't submit if slash mode is active (let PromptSelector handle it)
      if (slashMode) {
        return;
      }
      e.preventDefault();
      onSubmit();
    }

    // Escape closes slash mode
    if (e.key === 'Escape' && slashMode) {
      e.preventDefault();
      onChange('');
      closeSlashMode();
    }
  };

  return (
    <div className={containerStyles}>
      <div className={textareaWrapperStyles}>
        {slashMode && (
          <PromptSelector
            customPrompts={customPrompts}
            onSelectPrompt={handlePromptSelect}
            onClose={handlePromptSelectorClose}
          />
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('input.placeholder')}
          disabled={disabled}
          className={textareaStyles}
        />
        {value && !disabled && !slashMode && (
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
    border-color: var(--color-border-focus);
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

export default InputArea;
