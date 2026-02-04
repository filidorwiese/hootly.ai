import React from 'react';
import { css } from '@emotion/css';
import { t } from '../../shared/i18n';
import { radii, fontSizes, fontWeights, transitions, spacing } from '../../shared/styles';
import { SelectionIcon, FullPageIcon, NoContextIcon, ClipboardIcon } from '../../shared/icons';

interface ContextToggleProps {
  enabled: boolean;
  mode: 'none' | 'selection' | 'fullpage' | 'clipboard';
  selectionLength?: number;
  clipboardLength?: number;
  onToggle: () => void;
}

const ContextToggle: React.FC<ContextToggleProps> = ({ enabled, mode, selectionLength, clipboardLength, onToggle }) => {
  let buttonTitle = t('context.enableContext');
  let badgeText = t('context.noContext');
  let badgeType: 'selection' | 'full' | 'clipboard' | 'off' = 'off';
  let IconComponent = NoContextIcon;

  if (enabled && mode === 'selection' && selectionLength) {
    buttonTitle = t('context.switchToFullPage');
    badgeText = t('context.selection', { chars: selectionLength });
    badgeType = 'selection';
    IconComponent = SelectionIcon;
  } else if (enabled && mode === 'fullpage') {
    buttonTitle = clipboardLength && clipboardLength > 32 ? t('context.switchToClipboard') : t('context.disableContext');
    badgeText = t('context.fullPage');
    badgeType = 'full';
    IconComponent = FullPageIcon;
  } else if (enabled && mode === 'clipboard' && clipboardLength) {
    buttonTitle = t('context.disableContext');
    badgeText = t('context.clipboard', { chars: clipboardLength });
    badgeType = 'clipboard';
    IconComponent = ClipboardIcon;
  } else {
    buttonTitle = t('context.clickToEnable');
    badgeText = t('context.noContext');
    badgeType = 'off';
    IconComponent = NoContextIcon;
  }

  return (
    <div className={containerStyles}>
      <button
        onClick={onToggle}
        className={toggleButtonStyles(enabled)}
        title={buttonTitle}
      >
        <IconComponent size={20} />
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
  gap: ${spacing[2]};
`;

const toggleButtonStyles = (enabled: boolean) => css`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${enabled ? 'var(--color-border-focus)' : 'var(--color-border-default)'};
  border-radius: ${radii.lg};
  background: ${enabled ? 'var(--color-primary-50)' : 'var(--color-surface-default)'};
  cursor: pointer;
  transition: background ${transitions.default}, border-color ${transitions.default}, transform ${transitions.default};
  padding: 0;

  &:hover {
    border-color: ${enabled ? 'var(--color-primary-500)' : 'var(--color-border-strong)'};
    background: ${enabled ? 'var(--color-primary-100)' : 'var(--color-surface-hover)'};
    transform: scale(1.05);
  }

  &:active {
    background: ${enabled ? 'var(--color-primary-200)' : 'var(--color-surface-active)'};
    transform: scale(0.98);
  }
`;

const labelStyles = css`
  flex: 1;
  font-size: ${fontSizes.sm};
`;

const badgeStyles = (type: 'selection' | 'full' | 'clipboard' | 'off') => css`
  display: inline-block;
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: ${radii.md};
  font-size: ${fontSizes.sm};
  font-weight: ${fontWeights.medium};
  letter-spacing: 0.01em;
  border: 1px solid transparent;

  ${type === 'selection' && `
    background: var(--color-status-info-bg);
    color: var(--color-status-info-text);
    border-color: var(--color-status-info-border);
  `}

  ${type === 'full' && `
    background: var(--color-status-success-bg);
    color: var(--color-status-success-text);
    border-color: var(--color-status-success-border);
  `}

  ${type === 'clipboard' && `
    background: var(--color-status-warning-bg);
    color: var(--color-status-warning-text);
    border-color: var(--color-status-warning-border);
  `}

  ${type === 'off' && `
    background: var(--color-surface-disabled);
    color: var(--color-text-secondary);
    border-color: var(--color-border-light);
  `}
`;

export default ContextToggle;
