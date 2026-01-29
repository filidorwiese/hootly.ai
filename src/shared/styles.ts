/**
 * Flat Design Color Palette and CSS Variables
 *
 * Forest-themed flat design system with solid colors, no shadows or gradients.
 * WCAG AA compliant contrast ratios maintained.
 */

export const colors = {
  // Primary - Forest Green spectrum
  primary: {
    50: '#E8F0EA',
    100: '#D1E1D6',
    200: '#A3C4AC',
    300: '#75A683',
    400: '#4A7C54',
    500: '#3A5A40', // Main primary
    600: '#2D4733',
    700: '#203326',
    800: '#142019',
    900: '#0A100D',
  },

  // Background - Off-white/cream tones
  background: {
    base: '#FAFBF9',
    elevated: '#FFFFFF',
    muted: '#F5F7F4',
    subtle: '#EEF1EC',
  },

  // Surface - Card/container backgrounds
  surface: {
    default: '#FFFFFF',
    hover: '#F5F7F4',
    active: '#EEF1EC',
    disabled: '#F0F2EF',
  },

  // Border - Solid borders for flat design
  border: {
    light: '#E4E8E2',
    default: '#D4DCD6',
    strong: '#B8C4BC',
    focus: '#4A7C54',
  },

  // Text - Accessible contrast ratios
  text: {
    primary: '#2D3A30',
    secondary: '#6B7A6E',
    tertiary: '#8A9A8C',
    inverse: '#FFFFFF',
    link: '#3A5A40',
    linkHover: '#2D4733',
  },

  // Accent - Buttons and highlights
  accent: {
    success: '#4A7C54',
    successHover: '#3A6A44',
    info: '#3A7B89',
    infoHover: '#2E636E',
    warning: '#B8860B',
    warningHover: '#8B6914',
    error: '#C45A5A',
    errorHover: '#A54444',
  },

  // Semantic - Status indicators
  status: {
    successBg: '#E8F0EA',
    successText: '#2D4733',
    successBorder: '#A3C4AC',
    infoBg: '#E8F3F5',
    infoText: '#2E636E',
    infoBorder: '#A3C4C9',
    warningBg: '#FDF5E6',
    warningText: '#8B6914',
    warningBorder: '#D4C4A0',
    errorBg: '#FDF5F5',
    errorText: '#8B3A3A',
    errorBorder: '#D4A0A0',
  },

  // User/Assistant message backgrounds
  message: {
    userBg: '#EDF4F0',
    userBorder: '#C5D9CB',
    assistantBg: '#FFFFFF',
    assistantBorder: '#E4E8E2',
  },

  // Send button specific
  send: {
    default: '#99cd7e',
    hover: '#769d60',
    active: '#5f7d4d',
  },
} as const;

// Spacing scale (4px base unit)
export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
} as const;

// Border radius scale
export const radii = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '10px',
  '2xl': '12px',
  '3xl': '16px',
  full: '9999px',
} as const;

// Font sizes
export const fontSizes = {
  xs: '10px',
  sm: '12px',
  md: '13px',
  base: '14px',
  lg: '15px',
  xl: '16px',
  '2xl': '18px',
  '3xl': '20px',
  '4xl': '24px',
} as const;

// Font weights
export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Transition duration
export const transitions = {
  fast: '0.1s ease',
  default: '0.15s ease',
  slow: '0.25s ease',
} as const;

/**
 * CSS custom properties string for embedding in HTML pages
 * Use this in <style> tags for settings/history/personas pages
 */
export const cssVariables = `
  :root {
    /* Primary Colors */
    --color-primary-50: ${colors.primary[50]};
    --color-primary-100: ${colors.primary[100]};
    --color-primary-200: ${colors.primary[200]};
    --color-primary-300: ${colors.primary[300]};
    --color-primary-400: ${colors.primary[400]};
    --color-primary-500: ${colors.primary[500]};
    --color-primary-600: ${colors.primary[600]};
    --color-primary-700: ${colors.primary[700]};
    --color-primary-800: ${colors.primary[800]};
    --color-primary-900: ${colors.primary[900]};

    /* Backgrounds */
    --color-bg-base: ${colors.background.base};
    --color-bg-elevated: ${colors.background.elevated};
    --color-bg-muted: ${colors.background.muted};
    --color-bg-subtle: ${colors.background.subtle};

    /* Surfaces */
    --color-surface-default: ${colors.surface.default};
    --color-surface-hover: ${colors.surface.hover};
    --color-surface-active: ${colors.surface.active};
    --color-surface-disabled: ${colors.surface.disabled};

    /* Borders */
    --color-border-light: ${colors.border.light};
    --color-border-default: ${colors.border.default};
    --color-border-strong: ${colors.border.strong};
    --color-border-focus: ${colors.border.focus};

    /* Text */
    --color-text-primary: ${colors.text.primary};
    --color-text-secondary: ${colors.text.secondary};
    --color-text-tertiary: ${colors.text.tertiary};
    --color-text-inverse: ${colors.text.inverse};
    --color-text-link: ${colors.text.link};
    --color-text-link-hover: ${colors.text.linkHover};

    /* Accent */
    --color-accent-success: ${colors.accent.success};
    --color-accent-success-hover: ${colors.accent.successHover};
    --color-accent-info: ${colors.accent.info};
    --color-accent-info-hover: ${colors.accent.infoHover};
    --color-accent-warning: ${colors.accent.warning};
    --color-accent-warning-hover: ${colors.accent.warningHover};
    --color-accent-error: ${colors.accent.error};
    --color-accent-error-hover: ${colors.accent.errorHover};

    /* Status */
    --color-status-success-bg: ${colors.status.successBg};
    --color-status-success-text: ${colors.status.successText};
    --color-status-success-border: ${colors.status.successBorder};
    --color-status-info-bg: ${colors.status.infoBg};
    --color-status-info-text: ${colors.status.infoText};
    --color-status-info-border: ${colors.status.infoBorder};
    --color-status-warning-bg: ${colors.status.warningBg};
    --color-status-warning-text: ${colors.status.warningText};
    --color-status-warning-border: ${colors.status.warningBorder};
    --color-status-error-bg: ${colors.status.errorBg};
    --color-status-error-text: ${colors.status.errorText};
    --color-status-error-border: ${colors.status.errorBorder};

    /* Messages */
    --color-message-user-bg: ${colors.message.userBg};
    --color-message-user-border: ${colors.message.userBorder};
    --color-message-assistant-bg: ${colors.message.assistantBg};
    --color-message-assistant-border: ${colors.message.assistantBorder};

    /* Send Button */
    --color-send-default: ${colors.send.default};
    --color-send-hover: ${colors.send.hover};
    --color-send-active: ${colors.send.active};

    /* Spacing */
    --spacing-0: ${spacing[0]};
    --spacing-1: ${spacing[1]};
    --spacing-2: ${spacing[2]};
    --spacing-3: ${spacing[3]};
    --spacing-4: ${spacing[4]};
    --spacing-5: ${spacing[5]};
    --spacing-6: ${spacing[6]};
    --spacing-8: ${spacing[8]};
    --spacing-10: ${spacing[10]};
    --spacing-12: ${spacing[12]};

    /* Border Radius */
    --radius-none: ${radii.none};
    --radius-sm: ${radii.sm};
    --radius-md: ${radii.md};
    --radius-lg: ${radii.lg};
    --radius-xl: ${radii.xl};
    --radius-2xl: ${radii['2xl']};
    --radius-3xl: ${radii['3xl']};
    --radius-full: ${radii.full};

    /* Font Sizes */
    --font-size-xs: ${fontSizes.xs};
    --font-size-sm: ${fontSizes.sm};
    --font-size-md: ${fontSizes.md};
    --font-size-base: ${fontSizes.base};
    --font-size-lg: ${fontSizes.lg};
    --font-size-xl: ${fontSizes.xl};
    --font-size-2xl: ${fontSizes['2xl']};
    --font-size-3xl: ${fontSizes['3xl']};
    --font-size-4xl: ${fontSizes['4xl']};

    /* Font Weights */
    --font-weight-normal: ${fontWeights.normal};
    --font-weight-medium: ${fontWeights.medium};
    --font-weight-semibold: ${fontWeights.semibold};
    --font-weight-bold: ${fontWeights.bold};

    /* Transitions */
    --transition-fast: ${transitions.fast};
    --transition-default: ${transitions.default};
    --transition-slow: ${transitions.slow};
  }
`;

/**
 * Flat design reset - removes shadows and gradients
 * Apply to global styles
 */
export const flatReset = `
  * {
    box-shadow: none !important;
  }

  *:focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
`;

/**
 * Generate a flat button style
 */
export const flatButtonStyle = (variant: 'primary' | 'secondary' | 'danger' = 'primary') => {
  const variants = {
    primary: {
      bg: colors.accent.success,
      bgHover: colors.accent.successHover,
      text: colors.text.inverse,
      border: colors.accent.success,
    },
    secondary: {
      bg: colors.surface.default,
      bgHover: colors.surface.hover,
      text: colors.text.primary,
      border: colors.border.default,
    },
    danger: {
      bg: colors.accent.error,
      bgHover: colors.accent.errorHover,
      text: colors.text.inverse,
      border: colors.accent.error,
    },
  };

  const v = variants[variant];
  return `
    background: ${v.bg};
    color: ${v.text};
    border: 1px solid ${v.border};
    border-radius: ${radii.md};
    padding: ${spacing[2]} ${spacing[4]};
    font-size: ${fontSizes.base};
    font-weight: ${fontWeights.medium};
    cursor: pointer;
    transition: background ${transitions.default}, border-color ${transitions.default};

    &:hover {
      background: ${v.bgHover};
      border-color: ${v.bgHover};
    }

    &:active {
      transform: translateY(1px);
    }

    &:disabled {
      background: ${colors.surface.disabled};
      border-color: ${colors.border.light};
      color: ${colors.text.tertiary};
      cursor: not-allowed;
    }
  `;
};

/**
 * Generate a flat input style
 */
export const flatInputStyle = () => `
  background: ${colors.surface.default};
  color: ${colors.text.primary};
  border: 1px solid ${colors.border.default};
  border-radius: ${radii.md};
  padding: ${spacing[2]} ${spacing[3]};
  font-size: ${fontSizes.base};
  transition: border-color ${transitions.default};

  &:hover {
    border-color: ${colors.border.strong};
  }

  &:focus {
    border-color: ${colors.border.focus};
    outline: none;
  }

  &::placeholder {
    color: ${colors.text.tertiary};
  }

  &:disabled {
    background: ${colors.surface.disabled};
    color: ${colors.text.tertiary};
    cursor: not-allowed;
  }
`;

/**
 * Generate a flat card style
 */
export const flatCardStyle = () => `
  background: ${colors.surface.default};
  border: 1px solid ${colors.border.light};
  border-radius: ${radii.xl};
  padding: ${spacing[4]};
  transition: border-color ${transitions.default};

  &:hover {
    border-color: ${colors.border.strong};
  }
`;
