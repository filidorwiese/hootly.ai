import React from 'react';
import { css } from '@emotion/css';

interface ContextToggleProps {
  enabled: boolean;
  mode: 'none' | 'selection' | 'fullpage';
  selectionLength?: number;
  onToggle: () => void;
}

const ContextToggle: React.FC<ContextToggleProps> = ({ enabled, mode, selectionLength, onToggle }) => {
  let buttonTitle = 'Enable context';
  let badgeText = 'No context';
  let badgeType: 'selection' | 'full' | 'off' = 'off';

  if (enabled && mode === 'selection' && selectionLength) {
    buttonTitle = 'Click to switch to full page context';
    badgeText = `Selection (${selectionLength} chars)`;
    badgeType = 'selection';
  } else if (enabled && mode === 'fullpage') {
    buttonTitle = 'Click to disable context';
    badgeText = 'Full page';
    badgeType = 'full';
  } else {
    buttonTitle = 'Click to enable context';
    badgeText = 'No context';
    badgeType = 'off';
  }

  return (
    <div className={containerStyles}>
      <button
        onClick={onToggle}
        className={toggleButtonStyles(enabled)}
        title={buttonTitle}
      >
        🌐
      </button>
      <div className={labelStyles}>
        <span className={badgeStyles(badgeType)}>
          {badgeText}
        </span>
      </div>
    </div>
  );
};

const containerStyles = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const toggleButtonStyles = (enabled: boolean) => css`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${enabled ? '#4CAF50' : '#ddd'};
  border-radius: 6px;
  background: ${enabled ? '#e8f5e9' : 'white'};
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;

  &:hover {
    border-color: ${enabled ? '#45a049' : '#bbb'};
    background: ${enabled ? '#c8e6c9' : '#f5f5f5'};
  }
`;

const labelStyles = css`
  flex: 1;
  font-size: 13px;
`;

const badgeStyles = (type: 'selection' | 'full' | 'off') => css`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  ${type === 'selection' && `
    background: #e3f2fd;
    color: #1976d2;
  `}

  ${type === 'full' && `
    background: #e8f5e9;
    color: #388e3c;
  `}

  ${type === 'off' && `
    background: #f5f5f5;
    color: #666;
  `}
`;

export default ContextToggle;
