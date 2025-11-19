import React from 'react';
import { css } from '@emotion/css';

interface ResponseProps {
  content: string;
  isLoading: boolean;
}

const Response: React.FC<ResponseProps> = ({ content, isLoading }) => {
  return (
    <div className={containerStyles}>
      {isLoading && !content && (
        <div className={loadingStyles}>
          <div className={spinnerStyles} />
          <span>Thinking...</span>
        </div>
      )}

      {content && (
        <div className={contentStyles}>
          {/* @TODO: Add markdown rendering in Phase 3 */}
          <pre className={preStyles}>{content}</pre>
        </div>
      )}

      {!content && !isLoading && (
        <div className={placeholderStyles}>
          Start a conversation by typing a message below...
        </div>
      )}
    </div>
  );
};

const containerStyles = css`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: white;
`;

const loadingStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
  font-size: 14px;
`;

const spinnerStyles = css`
  width: 16px;
  height: 16px;
  border: 2px solid #e0e0e0;
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const contentStyles = css`
  font-size: 14px;
  line-height: 1.6;
  color: #333;
`;

const preStyles = css`
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const placeholderStyles = css`
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 40px 20px;
`;

export default Response;
