import React, { useEffect, useRef, useState } from 'react';
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversationHistory, currentResponse]);

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
            <button
              className={copyButtonStyles}
              onClick={() => handleCopy(message.content, index)}
              title={copiedIndex === index ? 'Copied!' : 'Copy to clipboard'}
            >
              {copiedIndex === index ? '✓' : '📋'}
            </button>
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
          <button
            className={copyButtonStyles}
            onClick={() => handleCopy(currentResponse, -1)}
            title={copiedIndex === -1 ? 'Copied!' : 'Copy to clipboard'}
          >
            {copiedIndex === -1 ? '✓' : '📋'}
          </button>
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
  max-height: 50vh;
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

const markdownStyles = css`
  font-size: 13px;
  line-height: 1.6;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 { font-size: 20px; }
  h2 { font-size: 18px; }
  h3 { font-size: 16px; }

  p {
    margin: 0 0 12px 0;
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

const messageContainerStyles = (role: 'user' | 'assistant') => css`
  position: relative;
  margin-bottom: 16px;
  padding: 14px;
  border-radius: 8px;
  background: ${role === 'user' ? '#e3f2fd' : '#fff'};
  border: 1px solid ${role === 'user' ? '#2196F3' : '#e0e0e0'};
  border-left: 4px solid ${role === 'user' ? '#1976d2' : '#4CAF50'};
  color: #212121;

  &:hover button {
    opacity: 1;
  }
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

const copyButtonStyles = css`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  &:active {
    transform: scale(0.95);
  }
`;

export default Response;
