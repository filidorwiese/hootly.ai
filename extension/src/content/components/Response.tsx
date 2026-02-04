import React, { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/css';
import { marked } from 'marked';
import hljs from 'highlight.js';
import type { Message } from '../../shared/types';
import { t } from '../../shared/i18n';
import { CopyIcon, CheckIcon, UserIcon, RobotIcon } from '../../shared/icons';

// Configure marked with renderer for code highlighting
const renderer = new marked.Renderer();
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  let highlighted = text;
  let detectedLang = lang;

  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(text, { language: lang }).value;
    } catch (e) {
      // Fallback to plain text
    }
  } else {
    try {
      const result = hljs.highlightAuto(text);
      highlighted = result.value;
      detectedLang = result.language;
    } catch (e) {
      // Fallback to plain text
    }
  }

  // Store raw text in data attribute for copying
  const escapedText = text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const langLabel = detectedLang ? `<span class="code-lang-label">${detectedLang}</span>` : '';
  return `<pre class="code-block-wrapper">${langLabel}<button class="code-copy-btn" data-code="${escapedText}" title="Copy code">📋</button><code class="hljs${lang ? ` language-${lang}` : ''}">${highlighted}</code></pre>`;
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
  const [, setCopiedCodeBlock] = useState<string | null>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversationHistory, currentResponse]);

  // Handle code block copy button clicks
  useEffect(() => {
    const handleCodeCopy = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('code-copy-btn')) {
        const code = target.getAttribute('data-code');
        if (code) {
          const unescaped = code.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
          navigator.clipboard.writeText(unescaped).then(() => {
            const originalText = target.textContent;
            setCopiedCodeBlock(code);
            target.textContent = '✓';
            setTimeout(() => {
              target.textContent = originalText || '📋';
              setCopiedCodeBlock(null);
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy code:', err);
          });
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('click', handleCodeCopy);
      return () => container.removeEventListener('click', handleCodeCopy);
    }
  }, []);

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
            <strong>⚠️ {t('response.error')}</strong>
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
              {message.role === 'user' ? <UserIcon size={16} /> : <RobotIcon size={16} />}
              <strong>{message.role === 'user' ? t('response.you') : t('response.claude')}</strong>
            </div>
            <div
              className={markdownStyles}
              dangerouslySetInnerHTML={{ __html: rendered }}
            />
            <button
              className={copyButtonStyles}
              onClick={() => handleCopy(message.content, index)}
              title={copiedIndex === index ? t('response.copied') : t('response.copyToClipboard')}
            >
              {copiedIndex === index ? <CheckIcon size={24} /> : <CopyIcon size={24} />}
            </button>
          </div>
        );
      })}

      {/* Render current streaming response */}
      {currentResponse && (
        <div className={messageContainerStyles('assistant')}>
          <div className={messageHeaderStyles}>
            <RobotIcon size={16} />
            <strong>{t('response.claude')}</strong>
            {isLoading && <span className={streamingIndicatorStyles}>●</span>}
          </div>
          <div
            className={markdownStyles}
            dangerouslySetInnerHTML={{ __html: marked.parse(currentResponse) }}
          />
          <button
            className={copyButtonStyles}
            onClick={() => handleCopy(currentResponse, -1)}
            title={copiedIndex === -1 ? t('response.copied') : t('response.copyToClipboard')}
          >
            {copiedIndex === -1 ? <CheckIcon size={24} /> : <CopyIcon size={24} />}
          </button>
        </div>
      )}

      {isLoading && !currentResponse && (
        <div className={loadingStyles}>
          <div className={spinnerStyles} />
          <span>{t('response.thinking')}</span>
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
  background: var(--color-bg-base);

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border-default);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-border-strong);
  }
`;

const loadingStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text-secondary);
  font-size: 13px;
  padding: 8px 0;
`;

const spinnerStyles = css`
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border-default);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const markdownStyles = css`
  font-family: 'Inter', sans-serif;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--color-text-primary);

  h1, h2, h3, h4, h5, h6 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--color-text-primary);
  }

  h1 { font-size: 19px; }
  h2 { font-size: 17px; }
  h3 { font-size: 15px; }

  p {
    margin: 0 0 14px 0;
  }

  code {
    background: var(--color-bg-subtle);
    padding: 2px 7px;
    border-radius: 5px;
    font-family: 'SF Mono', 'Fira Code', 'Monaco', 'Menlo', monospace;
    font-size: 12.5px;
    color: var(--color-primary-500);
  }

  pre {
    position: relative;
    background: var(--color-primary-800);
    padding: 14px 16px;
    border-radius: 10px;
    overflow-x: auto;
    margin: 0;
    margin-bottom: 16px;

    &.code-block-wrapper {
      padding-top: 32px;
      padding-right: 50px;
    }

    code {
      background: none;
      padding: 0;
      color: var(--color-primary-50);
      font-size: 12.5px;
    }
  }

  .code-lang-label {
    position: absolute;
    top: 8px;
    left: 12px;
    font-size: 11px;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
    font-family: 'SF Mono', 'Fira Code', 'Monaco', 'Menlo', monospace;
  }

  .code-copy-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(250, 251, 249, 0.1);
    border: 1px solid rgba(250, 251, 249, 0.2);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 13px;
    cursor: pointer;
    color: var(--color-primary-50);
    transition: all 0.15s ease;
    z-index: 1;
    opacity: 0;

    &:hover {
      background: rgba(250, 251, 249, 0.15);
      border-color: rgba(250, 251, 249, 0.3);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  pre:hover .code-copy-btn {
    opacity: 1;
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
    border-left: 3px solid var(--color-primary-500);
    background: var(--color-bg-subtle);
    border-radius: 0 8px 8px 0;
    color: var(--color-text-secondary);
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0 0 16px 0;
    border-radius: 8px;
    overflow: hidden;
  }

  th, td {
    border: 1px solid var(--color-border-default);
    padding: 10px 14px;
    text-align: left;
  }

  th {
    background: var(--color-bg-subtle);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  a {
    color: var(--color-text-link);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
      color: var(--color-text-link-hover);
    }
  }
`;

const errorStyles = css`
  background: var(--color-status-error-bg);
  color: var(--color-status-error-text);
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 14px;
  border-left: 3px solid var(--color-accent-error);
  font-size: 13px;
  line-height: 1.5;

  strong {
    font-weight: 600;
    display: block;
    color: var(--color-accent-error);
  }
`;

const messageContainerStyles = (role: 'user' | 'assistant') => css`
  position: relative;
  margin-bottom: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: ${role === 'user' ? 'var(--color-message-user-bg)' : 'var(--color-message-assistant-bg)'};
  border: 1px solid ${role === 'user' ? 'var(--color-message-user-border)' : 'var(--color-message-assistant-border)'};
  color: var(--color-text-primary);

  &:hover > button {
    opacity: 1;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const messageHeaderStyles = css`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;

  svg {
    flex-shrink: 0;
  }

  strong {
    color: var(--color-text-secondary);
    font-weight: 600;
  }
`;

const streamingIndicatorStyles = css`
  color: var(--color-primary-500);
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
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s ease;

  &:hover {
    background: var(--color-surface-hover);
    border-color: var(--color-border-strong);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export default Response;
