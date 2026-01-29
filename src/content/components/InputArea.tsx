import React, { useRef, useEffect } from 'react';
import { css } from '@emotion/css';
import ContextToggle from './ContextToggle';
import PersonaSelector from './PersonaSelector';
import ModelSelector from './ModelSelector';
import { t } from '../../shared/i18n';
import type { LLMProvider, Persona } from '../../shared/types';
import type { ModelConfig } from '../../shared/models';
import { colors, radii, fontSizes, transitions, spacing } from '../../shared/styles';

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
}

const InputArea: React.FC<InputAreaProps> = ({
  value, onChange, onSubmit, disabled,
  contextEnabled, contextMode, selectionLength, onContextToggle, modelId, provider,
  personas, selectedPersonaId, onSelectPersona,
  models, onSelectModel, isLoadingModels
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        {value && !disabled && (
          <>
            <button
                onClick={onSubmit}
                className={sendIconStyles}
                aria-label={t('input.send')}
                type="button"
            >
              ▶
            </button>
            <button
                onClick={() => onChange('')}
                className={clearIconStyles}
                aria-label={t('input.clear')}
                type="button"
            >
              ✕
            </button>
          </>
        )}
      </div>
      <div className={footerStyles}>
        <div className={footerLeftStyles}>
          <ContextToggle
            enabled={contextEnabled}
            mode={contextMode}
            selectionLength={selectionLength}
            onToggle={onContextToggle}
          />
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
  border: 1px solid ${colors.border.default};
  border-radius: ${radii.xl};
  font-size: ${fontSizes.md};
  font-family: 'Inter', sans-serif;
  resize: none;
  line-height: 1.55;
  box-sizing: border-box;
  outline: none;
  background: ${colors.surface.default};
  color: ${colors.text.primary};
  transition: border-color ${transitions.default};

  &:focus {
    border-color: ${colors.border.focus};
  }

  &:disabled {
    background: ${colors.surface.disabled};
    cursor: not-allowed;
    color: ${colors.text.secondary};
  }

  &::placeholder {
    color: ${colors.text.tertiary};
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
  background: ${colors.send.default};
  border: none;
  border-radius: ${radii.full};
  font-size: ${fontSizes.xs};
  color: ${colors.text.inverse};
  cursor: pointer;
  transition: background ${transitions.default};
  padding-left: 6px;

  &:hover {
    background: ${colors.send.hover};
  }

  &:active {
    background: ${colors.send.active};
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
  background: ${colors.surface.hover};
  border: none;
  border-radius: ${radii.full};
  font-size: ${fontSizes.sm};
  color: ${colors.text.secondary};
  cursor: pointer;
  transition: background ${transitions.default}, color ${transitions.default};

  &:hover {
    background: ${colors.surface.active};
    color: ${colors.text.primary};
  }

  &:active {
    background: ${colors.border.default};
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
