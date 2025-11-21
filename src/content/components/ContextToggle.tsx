import React from 'react';
import { css } from '@emotion/css';
import { t } from '../../shared/i18n';

interface ContextToggleProps {
  enabled: boolean;
  mode: 'none' | 'selection' | 'fullpage';
  selectionLength?: number;
  onToggle: () => void;
}

const ContextToggle: React.FC<ContextToggleProps> = ({ enabled, mode, selectionLength, onToggle }) => {
  let buttonTitle = t('context.enableContext');
  let badgeText = t('context.noContext');
  let badgeType: 'selection' | 'full' | 'off' = 'off';

  if (enabled && mode === 'selection' && selectionLength) {
    buttonTitle = t('context.switchToFullPage');
    badgeText = t('context.selection', { chars: selectionLength });
    badgeType = 'selection';
  } else if (enabled && mode === 'fullpage') {
    buttonTitle = t('context.disableContext');
    badgeText = t('context.fullPage');
    badgeType = 'full';
  } else {
    buttonTitle = t('context.clickToEnable');
    badgeText = t('context.noContext');
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
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid ${enabled ? '#4A7C54' : '#D4DCD6'};
  border-radius: 8px;
  background: ${enabled ? '#E8F0EA' : '#FFFFFF'};
  cursor: pointer;
  font-size: 16px;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${enabled ? '#3A6A44' : '#B8C4BC'};
    background: ${enabled ? '#DCE8DE' : '#F5F7F4'};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const labelStyles = css`
  flex: 1;
  font-size: 12px;
`;

const badgeStyles = (type: 'selection' | 'full' | 'off') => css`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.01em;

  ${type === 'selection' && `
    background: #E0EBE8;
    color: #2A6A5A;
  `}

  ${type === 'full' && `
    background: #E8F0EA;
    color: #3A6A44;
  `}

  ${type === 'off' && `
    background: #ECEEED;
    color: #6B7A6E;
  `}
`;

export default ContextToggle;
