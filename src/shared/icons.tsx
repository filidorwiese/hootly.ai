/**
 * Colorful SVG Icons for Hootly
 *
 * Flat design icons with colors matching the forest theme.
 * Replaces emoji icons with proper SVG icons.
 */
import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// Fire/Burn icon - Orange/red gradient for destructive action
export const FireIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 2C8.5 6 7 9 7 12c0 3.5 2.5 6 5 6s5-2.5 5-6c0-3-1.5-6-5-10z"
      fill="#FF6B35"
    />
    <path
      d="M12 6c-1.5 2-2.5 4-2.5 6 0 2 1 3.5 2.5 3.5s2.5-1.5 2.5-3.5c0-2-1-4-2.5-6z"
      fill="#FFB800"
    />
    <path
      d="M12 10c-.75 1-1.25 2-1.25 3 0 1 .5 1.75 1.25 1.75s1.25-.75 1.25-1.75c0-1-.5-2-1.25-3z"
      fill="#FFDD00"
    />
  </svg>
);

// History/Scroll icon - Brown/tan for historical documents
export const HistoryIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M6 4c-1 0-2 1-2 2v12c0 1 1 2 2 2h1v-2H6V6h1V4H6z"
      fill="#8B7355"
    />
    <path
      d="M7 4h11c1 0 2 1 2 2v12c0 1-1 2-2 2H7V4z"
      fill="#D4B896"
    />
    <path
      d="M9 8h8M9 12h8M9 16h5"
      stroke="#8B7355"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M18 4c1 0 2 1 2 2v1c0-.5-.5-1-1-1H7V4h11z"
      fill="#E8D5B7"
    />
  </svg>
);

// Settings/Gear icon - Blue/teal for utility
export const SettingsIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      fill="#3A7B89"
    />
    <path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      fill="#5BA3B0"
    />
  </svg>
);

// Close/X icon - Muted red for dismiss
export const CloseIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill="#E8E0D8" />
    <path
      d="M15 9l-6 6M9 9l6 6"
      stroke="#8B7355"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Send/Play icon - Green for positive action
export const SendIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill="#4A7C54" />
    <path
      d="M10 8l6 4-6 4V8z"
      fill="#FFFFFF"
    />
  </svg>
);

// Clear/Dismiss input icon - Neutral gray
export const ClearIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" fill="#D4DCD6" />
    <path
      d="M15 9l-6 6M9 9l6 6"
      stroke="#6B7A6E"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Globe/Context icon - Blue/teal for web context
export const GlobeIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" fill="#5BA3B0" />
    <ellipse cx="12" cy="12" rx="4" ry="9" fill="#3A7B89" />
    <path
      d="M3 12h18M4.5 7h15M4.5 17h15"
      stroke="#E8F3F5"
      strokeWidth="1"
      strokeOpacity="0.6"
    />
  </svg>
);

// Selection/Text icon - For selection context mode
export const SelectionIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#E8F0EA" stroke="#4A7C54" strokeWidth="1.5" />
    <path
      d="M7 8h10M7 12h10M7 16h6"
      stroke="#4A7C54"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <rect x="6" y="10" width="8" height="4" fill="#A3C4AC" fillOpacity="0.5" />
  </svg>
);

// Full page icon - For full page context mode
export const FullPageIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" fill="#E8F0EA" stroke="#4A7C54" strokeWidth="1.5" />
    <path
      d="M7 6h10M7 10h10M7 14h10M7 18h6"
      stroke="#4A7C54"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// No context icon - Disabled state
export const NoContextIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" fill="#F0F2EF" stroke="#B8C4BC" strokeWidth="1.5" />
    <path
      d="M8 12h8"
      stroke="#8A9A8C"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Export icon - For export functionality
export const ExportIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 3v12M12 3l-4 4M12 3l4 4"
      stroke="#4A7C54"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 17v2c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2"
      stroke="#4A7C54"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Import icon - For import functionality
export const ImportIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 15V3M12 15l-4-4M12 15l4-4"
      stroke="#3A7B89"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 17v2c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2"
      stroke="#3A7B89"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Trash/Delete icon - Red for destructive
export const TrashIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M3 6h18"
      stroke="#C45A5A"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"
      stroke="#C45A5A"
      strokeWidth="2"
    />
    <path
      d="M5 6l1 14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2l1-14"
      fill="#FFEAEA"
      stroke="#C45A5A"
      strokeWidth="2"
    />
    <path
      d="M10 10v8M14 10v8"
      stroke="#C45A5A"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// Add/Plus icon - Green for creation
export const AddIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" fill="#E8F0EA" stroke="#4A7C54" strokeWidth="1.5" />
    <path
      d="M12 8v8M8 12h8"
      stroke="#4A7C54"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Edit/Pencil icon - Blue for editing
export const EditIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M15.5 4.5l4 4L8 20H4v-4l11.5-11.5z"
      fill="#E8F3F5"
      stroke="#3A7B89"
      strokeWidth="1.5"
    />
    <path
      d="M13 7l4 4"
      stroke="#3A7B89"
      strokeWidth="1.5"
    />
  </svg>
);

// Back/Arrow icon - For navigation
export const BackIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M15 18l-6-6 6-6"
      stroke="#6B7A6E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Continue/Play icon - For resuming conversations
export const ContinueIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" fill="#E8F0EA" stroke="#4A7C54" strokeWidth="1.5" />
    <path
      d="M10 8l6 4-6 4V8z"
      fill="#4A7C54"
    />
  </svg>
);

// View/Eye icon - For viewing content
export const ViewIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"
      fill="#E8F3F5"
      stroke="#3A7B89"
      strokeWidth="1.5"
    />
    <circle cx="12" cy="12" r="3" fill="#3A7B89" />
  </svg>
);

// Search icon - For search functionality
export const SearchIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="11" cy="11" r="7" fill="#E8F0EA" stroke="#4A7C54" strokeWidth="2" />
    <path
      d="M16 16l5 5"
      stroke="#4A7C54"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Copy icon - For clipboard copy actions
export const CopyIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="8" y="8" width="12" height="12" rx="2" fill="#E8F3F5" stroke="#3A7B89" strokeWidth="1.5" />
    <path
      d="M16 8V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2"
      stroke="#5BA3B0"
      strokeWidth="1.5"
    />
  </svg>
);

// User icon - For user avatar in chat messages
export const UserIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="4" fill="#5BA3B0" />
    <path
      d="M4 20c0-4 4-6 8-6s8 2 8 6"
      fill="#3A7B89"
    />
  </svg>
);

// Robot icon - For AI/assistant avatar in chat messages
export const RobotIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="8" width="16" height="12" rx="2" fill="#4A7C54" />
    <circle cx="9" cy="13" r="2" fill="#FFFFFF" />
    <circle cx="15" cy="13" r="2" fill="#FFFFFF" />
    <rect x="10" y="17" width="4" height="2" rx="1" fill="#A3C4AC" />
    <path d="M12 4v4M10 4h4" stroke="#4A7C54" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Check/Success icon - For confirmation states
export const CheckIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" fill="#E8F0EA" stroke="#4A7C54" strokeWidth="1.5" />
    <path
      d="M8 12l3 3 5-6"
      stroke="#4A7C54"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
