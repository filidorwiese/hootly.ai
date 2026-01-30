import React, { useState, useRef, useEffect } from 'react';
import { css } from '@emotion/css';
import type { LLMProvider } from '../../shared/types';
import type { ModelConfig } from '../../shared/models';
import { t } from '../../shared/i18n';
import { radii, fontSizes, fontWeights, transitions, spacing } from '../../shared/styles';

interface ModelSelectorProps {
  models: ModelConfig[];
  selectedModelId: string;
  provider: LLMProvider;
  onSelectModel: (modelId: string) => void;
  isLoading?: boolean;
}

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
    const parts = modelId.split('/');
    const model = parts[parts.length - 1];
    return model
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  return modelId;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  provider,
  onSelectModel,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedModel = models.find((m) => m.id === selectedModelId);
  const displayName = selectedModel ? formatModelName(selectedModel.id, provider) : t('model.selectModel');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (modelId: string) => {
    onSelectModel(modelId);
    setIsOpen(false);
  };

  if (models.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className={containerStyles} ref={containerRef}>
      <button
        className={triggerStyles}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('model.selectModel')}
        title={selectedModel?.name || selectedModelId}
        disabled={isLoading || models.length === 0}
      >
        <span className={modelIconStyles}>🤖</span>
        <span className={nameStyles}>
          {isLoading ? t('model.loading') : displayName}
        </span>
        <span className={chevronStyles}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && models.length > 0 && (
        <div className={dropdownStyles}>
          {models.map((model) => (
            <button
              key={model.id}
              className={`${optionStyles} ${model.id === selectedModelId ? selectedOptionStyles : ''}`}
              onClick={() => handleSelect(model.id)}
              title={model.id}
            >
              <span className={optionNameStyles}>{formatModelName(model.id, provider)}</span>
              <span className={optionIdStyles}>{model.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const containerStyles = css`
  position: relative;
`;

const triggerStyles = css`
  display: flex;
  align-items: center;
  gap: ${spacing[1]};
  padding: ${spacing[1]} ${spacing[2]};
  background: transparent;
  border: 1px solid transparent;
  border-radius: ${radii.md};
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: ${fontSizes.sm};
  color: var(--color-text-secondary);
  transition: background ${transitions.default}, border-color ${transitions.default};

  &:hover:not(:disabled) {
    background: var(--color-surface-hover);
    border-color: var(--color-border-light);
  }

  &:active:not(:disabled) {
    background: var(--color-surface-active);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const modelIconStyles = css`
  font-size: ${fontSizes.sm};
`;

const nameStyles = css`
  font-weight: ${fontWeights.medium};
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const chevronStyles = css`
  font-size: 7px;
  color: var(--color-text-tertiary);
  margin-left: 1px;
`;

const dropdownStyles = css`
  position: absolute;
  bottom: calc(100% + ${spacing[1]});
  left: 0;
  min-width: 240px;
  max-width: 320px;
  max-height: 300px;
  overflow-y: auto;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border-default);
  border-radius: ${radii.xl};
  z-index: 1000;
  padding: ${spacing[1]};
`;

const optionStyles = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: ${spacing[2]};
  background: transparent;
  border: none;
  border-radius: ${radii.md};
  cursor: pointer;
  text-align: left;
  transition: background ${transitions.fast};

  &:hover {
    background: var(--color-surface-hover);
  }

  &:active {
    background: var(--color-surface-active);
  }
`;

const selectedOptionStyles = css`
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-100);
`;

const optionNameStyles = css`
  font-family: 'Inter', sans-serif;
  font-size: ${fontSizes.sm};
  font-weight: ${fontWeights.medium};
  color: var(--color-text-primary);
`;

const optionIdStyles = css`
  font-family: 'Inter', sans-serif;
  font-size: ${fontSizes.xs};
  color: var(--color-text-tertiary);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default ModelSelector;
