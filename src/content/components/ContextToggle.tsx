import React, { useState, useEffect } from 'react';
import { css } from '@emotion/css';
import { extractSelection } from '../../shared/utils';

interface ContextToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const ContextToggle: React.FC<ContextToggleProps> = ({ enabled, onToggle }) => {
  const [selectionText, setSelectionText] = useState<string | null>(null);

  useEffect(() => {
    // Check for text selection when component mounts or enabled state changes
    const selection = extractSelection();
    setSelectionText(selection);
  }, [enabled]);

  const hasSelection = !!selectionText;

  return (
    <div className={containerStyles}>
      <button
        onClick={() => onToggle(!enabled)}
        className={toggleButtonStyles(enabled)}
        title={enabled ? 'Disable page context' : 'Enable page context'}
      >
        🌐
      </button>
      <div className={labelStyles}>
        {enabled && hasSelection && (
          <span className={badgeStyles('selection')}>
            Selection ({selectionText.length} chars)
          </span>
        )}
        {enabled && !hasSelection && (
          <span className={badgeStyles('full')}>
            Full page context
          </span>
        )}
        {!enabled && (
          <span className={badgeStyles('off')}>
            No context
          </span>
        )}
      </div>
      {/* @TODO: Add preview button in Phase 3 */}
    </div>
  );
};

const containerStyles = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
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
