import React, { useRef, useEffect } from 'react';
import { css } from '@emotion/css';
import ContextToggle from './ContextToggle';
import { t } from '../../shared/i18n';

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
}

const InputArea: React.FC<InputAreaProps> = ({
  value, onChange, onSubmit, disabled,
  contextEnabled, contextMode, selectionLength, onContextToggle, tokenCount, modelId
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
          <button
            onClick={() => onChange('')}
            className={clearIconStyles}
            aria-label={t('input.clear')}
            type="button"
          >
            ✕
          </button>
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
          {modelId && <span className={modelIdStyles}>{modelId}</span>}
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
  padding: 12px 36px 12px 14px;
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
