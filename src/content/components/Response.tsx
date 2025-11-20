import React, { useMemo, useEffect, useRef } from 'react';
import { css } from '@emotion/css';
import { marked } from 'marked';
import hljs from 'highlight.js';
import type { Message } from '../../shared/types';

// Configure marked with renderer for code highlighting
const renderer = new marked.Renderer();
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  let highlighted = text;
  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(text, { language: lang }).value;
    } catch (e) {
      // Fallback to plain text
    }
  } else {
    try {
      highlighted = hljs.highlightAuto(text).value;
    } catch (e) {
      // Fallback to plain text
    }
  }
  return `<pre><code class="hljs${lang ? ` language-${lang}` : ''}">${highlighted}</code></pre>`;
};

marked.use({ renderer, breaks: true });

interface ResponseProps {
  conversationHistory: Message[];
  currentResponse: string;
  isLoading: boolean;
  error?: string | null;
}

const Response: React.FC<ResponseProps> = ({ conversationHistory, currentResponse, isLoading, error }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversationHistory, currentResponse]);

  const hasContent = conversationHistory.length > 0 || currentResponse;

  return (
    <div ref={containerRef} className={containerStyles}>
      {error && (
        <div className={errorStyles}>
          <div style={{ marginBottom: '8px' }}>
            <strong>⚠️ Error</strong>
          </div>
          <div>{error}</div>
        </div>
      )}

      {!hasContent && !isLoading && !error && (
        <div className={placeholderStyles}>
          Start a conversation by typing a message below...
        </div>
      )}

      {/* Render conversation history */}
      {conversationHistory.map((message, index) => {
        const rendered = marked.parse(message.content);
        return (
          <div key={index} className={messageContainerStyles(message.role)}>
            <div className={messageHeaderStyles}>
              <strong>{message.role === 'user' ? '👤 You' : '🤖 Claude'}</strong>
            </div>
            <div
              className={markdownStyles}
              dangerouslySetInnerHTML={{ __html: rendered }}
            />
          </div>
        );
      })}

      {/* Render current streaming response */}
      {currentResponse && (
        <div className={messageContainerStyles('assistant')}>
          <div className={messageHeaderStyles}>
            <strong>🤖 Claude</strong>
            {isLoading && <span className={streamingIndicatorStyles}>●</span>}
          </div>
          <div
            className={markdownStyles}
            dangerouslySetInnerHTML={{ __html: marked.parse(currentResponse) }}
          />
        </div>
      )}

      {isLoading && !currentResponse && (
        <div className={loadingStyles}>
          <div className={spinnerStyles} />
          <span>Thinking...</span>
        </div>
      )}
    </div>
  );
};

const containerStyles = css`
  flex: 1;
  max-height: 80vh;
  overflow-y: scroll;
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
  position: relative;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
`;

const markdownStyles = css`
  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 12px;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 { font-size: 28px; }
  h2 { font-size: 24px; }
  h3 { font-size: 20px; }

  p {
    margin: 0 0 16px 0;
  }

  code {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: 13px;
  }

  pre {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0 0 16px 0;

    code {
      background: none;
      padding: 0;
    }
  }

  ul, ol {
    margin: 0 0 16px 0;
    padding-left: 24px;
  }

  li {
    margin-bottom: 4px;
  }

  blockquote {
    margin: 0 0 16px 0;
    padding-left: 16px;
    border-left: 3px solid #ddd;
    color: #666;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0 0 16px 0;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: left;
  }

  th {
    background: #f5f5f5;
    font-weight: 600;
  }

  a {
    color: #4CAF50;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const copyButtonStyles = css`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  padding: 8px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  margin-top: 16px;

  &:hover {
    background: #f0f0f0;
  }
`;

const errorStyles = css`
  background: #ffebee;
  color: #c62828;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  border-left: 4px solid #c62828;
  font-size: 14px;
  line-height: 1.5;

  strong {
    font-weight: 600;
    display: block;
  }
`;

const placeholderStyles = css`
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 40px 20px;
`;

const messageContainerStyles = (role: 'user' | 'assistant') => css`
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 8px;
  background: ${role === 'user' ? '#f0f7ff' : '#f9f9f9'};
  border-left: 4px solid ${role === 'user' ? '#2196F3' : '#4CAF50'};
`;

const messageHeaderStyles = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;

  strong {
    color: #333;
  }
`;

const streamingIndicatorStyles = css`
  color: #4CAF50;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
`;

export default Response;
