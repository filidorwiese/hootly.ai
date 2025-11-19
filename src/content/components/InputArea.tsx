import React, { useRef, useEffect } from 'react';
import { css } from '@emotion/css';
import { estimateTokens } from '../../shared/utils';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ value, onChange, onSubmit, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const tokenCount = estimateTokens(value);

  return (
    <div className={containerStyles}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Claude anything... (Enter to send, Shift+Enter for newline)"
        disabled={disabled}
        className={textareaStyles}
      />
      <div className={footerStyles}>
        <div className={tokenCountStyles}>
          {value.length > 0 && (
            <>
              {value.length} chars · ~{tokenCount} tokens
            </>
          )}
        </div>
        <div className={actionsStyles}>
          <button
            onClick={() => onChange('')}
            disabled={disabled || !value}
            className={clearButtonStyles}
          >
            Clear
          </button>
          <button
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            className={sendButtonStyles}
          >
            {disabled ? 'Sending...' : 'Send'}
          </button>
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

const textareaStyles = css`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  resize: none;
  line-height: 1.5;
  box-sizing: border-box;
  outline: none;

  &:focus {
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #999;
  }
`;

const footerStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const tokenCountStyles = css`
  font-size: 12px;
  color: #666;
`;

const actionsStyles = css`
  display: flex;
  gap: 8px;
`;

const clearButtonStyles = css`
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  color: #666;

  &:hover:not(:disabled) {
    background: #f5f5f5;
    border-color: #bbb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const sendButtonStyles = css`
  padding: 6px 16px;
  background: #4CAF50;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #45a049;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default InputArea;
