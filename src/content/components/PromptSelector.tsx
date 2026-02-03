import React, { useState, useRef, useEffect, useCallback } from 'react';
import { css } from '@emotion/css';
import type { SavedPrompt } from '../../shared/types';
import { DEFAULT_PROMPTS } from '../../shared/types';
import { getLocalizedPromptText } from '../../shared/i18n';
import { radii, fontSizes, fontWeights, transitions, spacing } from '../../shared/styles';

interface PromptSelectorProps {
  customPrompts: SavedPrompt[];
  onSelectPrompt: (text: string) => void;
  onClose: () => void;
}

const PromptSelector: React.FC<PromptSelectorProps> = ({
  customPrompts,
  onSelectPrompt,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [openAbove, setOpenAbove] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Combine built-in and custom prompts
  const allPrompts: SavedPrompt[] = [...DEFAULT_PROMPTS, ...customPrompts];

  // Get display text for a prompt
  const getDisplayText = (prompt: SavedPrompt): string => {
    if (prompt.isBuiltIn) {
      return getLocalizedPromptText(prompt.id) || prompt.text;
    }
    return prompt.text;
  };

  // Filter prompts based on search query
  const filteredPrompts = allPrompts.filter((prompt) => {
    const text = getDisplayText(prompt).toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  // Calculate position and auto-focus on mount
  useEffect(() => {
    searchInputRef.current?.focus();

    // Check if there's enough room below
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 450; // max-height 400px + search input ~50px
      const spaceBelow = window.innerHeight - rect.top;
      setOpenAbove(spaceBelow < dropdownHeight);
    }
  }, []);

  // Reset highlight when filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-prompt-item]');
      const item = items[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback((prompt: SavedPrompt) => {
    onSelectPrompt(getDisplayText(prompt));
  }, [onSelectPrompt]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredPrompts.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredPrompts[highlightedIndex]) {
          handleSelect(filteredPrompts[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'Backspace':
        if (searchQuery === '') {
          e.preventDefault();
          onClose();
        }
        break;
    }
  }, [filteredPrompts, highlightedIndex, handleSelect, onClose, searchQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const truncateText = (text: string, maxLength: number = 80): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className={`${containerStyles} ${openAbove ? containerAboveStyles : containerBelowStyles}`} ref={containerRef} onKeyDown={handleKeyDown}>
      <input
        ref={searchInputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search prompts..."
        className={searchInputStyles}
      />
      <div className={listStyles} ref={listRef}>
        {filteredPrompts.length === 0 ? (
          <div className={emptyStyles}>No matching prompts</div>
        ) : (
          filteredPrompts.map((prompt, index) => (
            <button
              key={prompt.id}
              data-prompt-item
              className={`${itemStyles} ${index === highlightedIndex ? highlightedStyles : ''}`}
              onClick={() => handleSelect(prompt)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className={textStyles}>{truncateText(getDisplayText(prompt))}</span>
              {prompt.isBuiltIn && <span className={builtInBadgeStyles}>Built-in</span>}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

const containerStyles = css`
  position: absolute;
  left: 0;
  right: 0;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border-default);
  border-radius: ${radii.xl};
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const containerBelowStyles = css`
  top: calc(100% + ${spacing[2]});
`;

const containerAboveStyles = css`
  bottom: calc(100% + ${spacing[2]});
`;

const searchInputStyles = css`
  padding: ${spacing[3]};
  border: none;
  border-bottom: 1px solid var(--color-border-light);
  font-family: 'Inter', sans-serif;
  font-size: ${fontSizes.md};
  background: var(--color-surface-default);
  color: var(--color-text-primary);
  outline: none;

  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

const listStyles = css`
  max-height: 400px;
  overflow-y: auto;
  padding: ${spacing[1]};
`;

const itemStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing[2]};
  width: 100%;
  padding: ${spacing[2]} ${spacing[3]};
  background: transparent;
  border: none;
  border-radius: ${radii.md};
  cursor: pointer;
  text-align: left;
  transition: background ${transitions.fast};

  &:hover {
    background: var(--color-surface-hover);
  }
`;

const highlightedStyles = css`
  background: var(--color-primary-50);
`;

const textStyles = css`
  font-family: 'Inter', sans-serif;
  font-size: ${fontSizes.sm};
  color: var(--color-text-primary);
  line-height: 1.4;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const builtInBadgeStyles = css`
  font-family: 'Inter', sans-serif;
  font-size: 9px;
  font-weight: ${fontWeights.medium};
  color: var(--color-text-tertiary);
  background: var(--color-bg-muted);
  padding: 2px 6px;
  border-radius: ${radii.sm};
  flex-shrink: 0;
`;

const emptyStyles = css`
  padding: ${spacing[4]};
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: ${fontSizes.sm};
  color: var(--color-text-tertiary);
`;

export default PromptSelector;
