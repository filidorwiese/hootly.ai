import React, { useRef, useEffect } from 'react';
import { css } from '@emotion/css';
import ContextToggle from './ContextToggle';
import { t } from '../../shared/i18n';
import type { LLMProvider } from '../../shared/types';

function formatModelName(modelId: string, provider?: LLMProvider): string {
  if (!modelId) return '';

  // Claude models: claude-sonnet-4-5-20250514 -> Claude Sonnet 4.5
  if (provider === 'claude' || modelId.startsWith('claude')) {
    const match = modelId.match(/claude[- ](sonnet|opus|haiku)[- ]?(\d+)?[- ]?(\d+)?/i);
    if (match) {
      const variant = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      const version = match[2] && match[3] ? `${match[2]}.${match[3]}` : match[2] || '';
      return `Claude ${variant}${version ? ' ' + version : ''}`;
    }
    return modelId;
  }

  // OpenAI models: gpt-4o, gpt-4-turbo, o1-preview -> GPT-4o, GPT-4 Turbo, O1 Preview
  if (provider === 'openai' || modelId.startsWith('gpt') || modelId.startsWith('o1') || modelId.startsWith('o3')) {
    return modelId
      .replace(/^gpt-/, 'GPT-')
      .replace(/^o(\d)/, 'O$1')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  // Gemini models: gemini-1.5-pro -> Gemini 1.5 Pro
  if (provider === 'gemini' || modelId.startsWith('gemini')) {
    return modelId
      .replace(/^gemini-/, 'Gemini ')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  // OpenRouter: various formats, just clean up
  if (provider === 'openrouter') {
    // Format: provider/model-name -> Model Name
    const parts = modelId.split('/');
    const model = parts[parts.length - 1];
    return model
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  return modelId;
}

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  contextEnabled: boolean;
  contextMode: 'none' | 'selection' | 'fullpage';
  selectionLength?: number;
  onContextToggle: () => void;
  tokenCount: number;
  modelId?: string;
  provider?: LLMProvider;
}

const InputArea: React.FC<InputAreaProps> = ({
  value, onChange, onSubmit, disabled,
  contextEnabled, contextMode, selectionLength, onContextToggle, tokenCount, modelId, provider
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
        <ContextToggle
          enabled={contextEnabled}
          mode={contextMode}
          selectionLength={selectionLength}
          onToggle={onContextToggle}
        />
        <div className={rightGroupStyles}>
          <span className={tokenCountStyles}>{t('input.tokens', { count: tokenCount })}</span>
          {modelId && (
            <span className={modelIdStyles}>
              {formatModelName(modelId, provider)}
            </span>
          )}
        </div>
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
  padding: 12px 70px 12px 14px;
  border: 1px solid #D4DCD6;
  border-radius: 10px;
  font-size: 13.5px;
  font-family: 'Inter', sans-serif;
  resize: none;
  line-height: 1.55;
  box-sizing: border-box;
  outline: none;
  background: #FFFFFF;
  color: #2D3A30;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: #4A7C54;
    box-shadow: 0 0 0 3px rgba(74, 124, 84, 0.1);
  }

  &:disabled {
    background: #EEF1EC;
    cursor: not-allowed;
    color: #6B7A6E;
  }

  &::placeholder {
    color: #9AA89C;
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
  background: #99cd7e;
  border: none;
  border-radius: 50%;
  font-size: 9px;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.15s ease;
  padding-left: 6px;

  &:hover {
    background: #769d60;
    transform: scale(1.05);
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
  background: #E8ECE9;
  border: none;
  border-radius: 50%;
  font-size: 11px;
  color: #6B7A6E;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #D4DCD6;
    color: #3A4A3C;
  }

  &:active {
    transform: scale(0.9);
  }
`;

const footerStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const rightGroupStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const tokenCountStyles = css`
  font-size: 11px;
  color: #8A9A8C;
  font-weight: 500;
`;

const modelIdStyles = css`
  font-size: 10px;
  color: #B0BAB2;
  font-weight: 400;
`;

export default InputArea;
