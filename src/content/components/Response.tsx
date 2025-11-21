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
  max-height: min(50vh, 400px);
  overflow-y: auto;
  padding: 18px;
  background: #FAFBF9;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #D4DCD6;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #B8C4BC;
  }
`;

const loadingStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6B7A6E;
  font-size: 13px;
  padding: 8px 0;
`;

const spinnerStyles = css`
  width: 18px;
  height: 18px;
  border: 2px solid #D4DCD6;
  border-top-color: #4A7C54;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const markdownStyles = css`
  font-size: 13.5px;
  line-height: 1.65;
  color: #2D3A30;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-weight: 600;
    line-height: 1.3;
    color: #1E2820;
  }

  h1 { font-size: 19px; }
  h2 { font-size: 17px; }
  h3 { font-size: 15px; }

  p {
    margin: 0 0 14px 0;
  }

  code {
    background: #E8EDE9;
    padding: 2px 7px;
    border-radius: 5px;
    font-family: 'SF Mono', 'Fira Code', 'Monaco', 'Menlo', monospace;
    font-size: 12.5px;
    color: #3A5A40;
  }

  pre {
    background: #1E2820;
    padding: 14px 16px;
    border-radius: 10px;
    overflow-x: auto;
    margin: 0 0 16px 0;

    code {
      background: none;
      padding: 0;
      color: #E8EDE9;
      font-size: 12.5px;
    }
  }

  ul, ol {
    margin: 0 0 16px 0;
    padding-left: 22px;
  }

  li {
    margin-bottom: 6px;
  }

  blockquote {
    margin: 0 0 16px 0;
    padding: 12px 16px;
    border-left: 3px solid #4A7C54;
    background: #EEF2EF;
    border-radius: 0 8px 8px 0;
    color: #4A5A4C;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0 0 16px 0;
    border-radius: 8px;
    overflow: hidden;
  }

  th, td {
    border: 1px solid #D4DCD6;
    padding: 10px 14px;
    text-align: left;
  }

  th {
    background: #EEF2EF;
    font-weight: 600;
    color: #2D3A30;
  }

  a {
    color: #3A7248;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
      color: #2E5A3A;
    }
  }
`;

const errorStyles = css`
  background: #FDF5F5;
  color: #8B3E3E;
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 14px;
  border-left: 3px solid #C45A5A;
  font-size: 13px;
  line-height: 1.5;

  strong {
    font-weight: 600;
    display: block;
    color: #9B4444;
  }
`;

const messageContainerStyles = (role: 'user' | 'assistant') => css`
  position: relative;
  margin-bottom: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: ${role === 'user' ? '#EDF4F0' : '#FFFFFF'};
  border: 1px solid ${role === 'user' ? '#C5D9CB' : '#E4E8E2'};
  color: #2D3A30;
  box-shadow: ${role === 'assistant' ? '0 1px 3px rgba(45, 60, 48, 0.04)' : 'none'};

  &:hover button {
    opacity: 1;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const messageHeaderStyles = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #6B7A6E;
  text-transform: uppercase;
  letter-spacing: 0.03em;

  strong {
    color: #4A5A4C;
    font-weight: 600;
  }
`;

const streamingIndicatorStyles = css`
  color: #4A7C54;
  font-size: 10px;
  animation: pulse 1.2s ease-in-out infinite;

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
  top: 10px;
  right: 10px;
  background: rgba(250, 251, 249, 0.95);
  border: 1px solid #D4DCD6;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s ease;

  &:hover {
    background: #EEF2EF;
    border-color: #B8C4BC;
  }

  &:active {
    transform: scale(0.95);
  }
`;

export default Response;
