import React, { useState, useEffect } from 'react';
import { css } from '@emotion/css';
import { Storage } from '../../shared/storage';

interface SelectionTooltipProps {
  onOpenWithSelection: () => void;
}

const SelectionTooltip: React.FC<SelectionTooltipProps> = ({ onOpenWithSelection }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shortcut, setShortcut] = useState('Alt+C');

  useEffect(() => {
    // Load shortcut from settings
    Storage.getSettings().then((settings) => {
      setShortcut(settings.shortcut);
    });

    // Listen for shortcut updates
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.settings?.newValue?.shortcut) {
        setShortcut(changes.settings.newValue.shortcut);
      }
    });

    // Listen for text selection
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const hasSelection = selection && selection.toString().trim().length > 0;
      setIsVisible(!!hasSelection);
    };

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={tooltipStyles} onClick={onOpenWithSelection}>
      <svg className={iconStyles} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fire-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF6B35', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#F7931E', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path
          d="M30 70 Q20 50 30 30 Q35 20 45 25 Q40 35 45 45 Q55 20 70 30 Q80 40 75 55 Q70 70 50 75 Q30 80 30 70 Z"
          fill="url(#fire-gradient)"
        />
        <circle cx="45" cy="45" r="3" fill="white" opacity="0.9" />
        <circle cx="55" cy="50" r="2.5" fill="white" opacity="0.7" />
        <circle cx="50" cy="55" r="2" fill="white" opacity="0.5" />
      </svg>
      <span>Press <strong>{shortcut}</strong> to chat with selection</span>
    </div>
  );
};

const tooltipStyles = css`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  z-index: 999997;
  animation: slideIn 0.2s ease-out;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  span {
    white-space: nowrap;
  }

  strong {
    font-weight: 600;
    color: #4CAF50;
  }
`;

const iconStyles = css`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

export default SelectionTooltip;
