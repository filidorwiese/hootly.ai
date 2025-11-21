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
}

const InputArea: React.FC<InputAreaProps> = ({
  value, onChange, onSubmit, disabled,
  contextEnabled, contextMode, selectionLength, onContextToggle, tokenCount
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
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('input.placeholder')}
        disabled={disabled}
        className={textareaStyles}
      />
      <div className={footerStyles}>
        <div className={leftGroupStyles}>
          <ContextToggle
            enabled={contextEnabled}
            mode={contextMode}
            selectionLength={selectionLength}
            onToggle={onContextToggle}
          />
          <span className={tokenCountStyles}>{t('input.tokens', { count: tokenCount })}</span>
        </div>
        <div className={actionsStyles}>
          <button
            onClick={() => onChange('')}
            disabled={disabled || !value}
            className={clearButtonStyles}
          >
            {t('input.clear')}
          </button>
          <button
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            className={sendButtonStyles}
          >
            {disabled ? t('input.sending') : t('input.send')}
          </button>
        </div>
      </div>
    </div>
  );
};

const containerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const textareaStyles = css`
  width: 100%;
  padding: 12px 14px;
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

const footerStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const leftGroupStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const tokenCountStyles = css`
  font-size: 11px;
  color: #8A9A8C;
  font-weight: 500;
`;

const actionsStyles = css`
  display: flex;
  gap: 8px;
`;

const clearButtonStyles = css`
  padding: 8px 14px;
  background: #FFFFFF;
  border: 1px solid #D4DCD6;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: #5A6A5C;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: #EEF2EF;
    border-color: #B8C4BC;
    color: #3A4A3C;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const sendButtonStyles = css`
  padding: 8px 18px;
  background: linear-gradient(to bottom, #4A8B58, #3A7248);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(58, 114, 72, 0.2);
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(to bottom, #4A9B60, #3A8250);
    box-shadow: 0 2px 4px rgba(58, 114, 72, 0.25);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export default InputArea;
