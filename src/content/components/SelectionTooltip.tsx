import React, { useState, useEffect } from 'react';
import { css } from '@emotion/css';
import { Storage } from '../../shared/storage';

interface SelectionTooltipProps {
  onOpenWithSelection: () => void;
}

const SelectionTooltip: React.FC<SelectionTooltipProps> = ({ onOpenWithSelection }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shortcut, setShortcut] = useState('Alt+C');
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Load settings
    Storage.getSettings().then((settings) => {
      setShortcut(settings.shortcut);
      setIsEnabled(settings.showSelectionTooltip !== false);
    });

    // Listen for settings updates
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.settings?.newValue?.shortcut !== undefined) {
        setShortcut(changes.settings.newValue.shortcut);
      }
      if (changes.settings?.newValue?.showSelectionTooltip !== undefined) {
        setIsEnabled(changes.settings.newValue.showSelectionTooltip);
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Listen for selection changes from parent window (content script)
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'hootly-selection-change') {
        setIsVisible(event.data.payload?.hasSelection || false);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!isEnabled || !isVisible) return null;

  return (
    <div className={tooltipStyles} onClick={onOpenWithSelection}>
      <img src={chrome.runtime.getURL('icons/icon-48.png')} alt="" className={iconStyles} />
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
  font-family: 'Inter', sans-serif;
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
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

export default SelectionTooltip;
