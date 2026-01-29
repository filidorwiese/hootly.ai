import React from 'react';
import { css } from '@emotion/css';
import { t } from '../../shared/i18n';
import { colors, radii, fontSizes, fontWeights, transitions, spacing } from '../../shared/styles';
import { SelectionIcon, FullPageIcon, NoContextIcon } from '../../shared/icons';

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
  let IconComponent = NoContextIcon;

  if (enabled && mode === 'selection' && selectionLength) {
    buttonTitle = t('context.switchToFullPage');
    badgeText = t('context.selection', { chars: selectionLength });
    badgeType = 'selection';
    IconComponent = SelectionIcon;
  } else if (enabled && mode === 'fullpage') {
    buttonTitle = t('context.disableContext');
    badgeText = t('context.fullPage');
    badgeType = 'full';
    IconComponent = FullPageIcon;
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
  border: 1px solid ${enabled ? colors.border.focus : colors.border.default};
  border-radius: ${radii.lg};
  background: ${enabled ? colors.primary[50] : colors.surface.default};
  cursor: pointer;
  transition: background ${transitions.default}, border-color ${transitions.default}, transform ${transitions.default};
  padding: 0;

  &:hover {
    border-color: ${enabled ? colors.primary[500] : colors.border.strong};
    background: ${enabled ? colors.primary[100] : colors.surface.hover};
    transform: scale(1.05);
  }

  &:active {
    background: ${enabled ? colors.primary[200] : colors.surface.active};
    transform: scale(0.98);
  }
`;

const labelStyles = css`
  flex: 1;
  font-size: ${fontSizes.sm};
`;

const badgeStyles = (type: 'selection' | 'full' | 'off') => css`
  display: inline-block;
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: ${radii.md};
  font-size: ${fontSizes.sm};
  font-weight: ${fontWeights.medium};
  letter-spacing: 0.01em;
  border: 1px solid transparent;

  ${type === 'selection' && `
    background: ${colors.status.infoBg};
    color: ${colors.status.infoText};
    border-color: ${colors.status.infoBorder};
  `}

  ${type === 'full' && `
    background: ${colors.status.successBg};
    color: ${colors.status.successText};
    border-color: ${colors.status.successBorder};
  `}

  ${type === 'off' && `
    background: ${colors.surface.disabled};
    color: ${colors.text.secondary};
    border-color: ${colors.border.light};
  `}
`;

export default ContextToggle;
