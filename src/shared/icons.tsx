/**
 * Colorful SVG Icons for Hootly
 *
 * Flat design icons with colors matching the forest theme.
 * Replaces emoji icons with proper SVG icons.
 *
 * ViewBox Convention:
 * - 80x80: Complex colorful icons from glyphs.fyi (FireIcon, HistoryIcon,
 *   SettingsIcon, SendIcon, UserIcon) - multi-color with detailed paths
 * - 24x24: Simple hand-crafted icons (CloseIcon, ClearIcon, SelectionIcon,
 *   FullPageIcon, NoContextIcon, CopyIcon, RobotIcon, CheckIcon) - minimal strokes
 *
 * All icons accept a `size` prop that scales uniformly regardless of viewBox.
 */
import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
}

// Fire/Burn icon - Orange/red gradient for destructive action
export const FireIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
         className={className}>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M21.2993 27.0826L29.1526 38.05C29.1759 38.0824 29.2242 38.0824 29.2474 38.05L47.9007 12L59.2571 27.8595C62.3415 32.167 64 37.332 64 42.6298V44C64 57.2548 53.2548 68 40 68C26.7452 68 16 57.2548 16 44V42.6298C16 37.332 17.6585 32.167 20.7429 27.8595L21.2993 27.0826Z"
              fill="#EB5757"/>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M23.6285 41.1088L29.1526 48.8234C29.1759 48.8558 29.2242 48.8558 29.2474 48.8234L46.0001 25.4277L53.4105 34.9319C55.6071 37.749 56.7999 41.2189 56.7999 44.7912C56.7999 53.6466 49.6212 60.8254 40.7657 60.8254H39.2342C30.3787 60.8254 23.2 53.6466 23.2 44.7912C23.2 43.5434 23.3455 42.3081 23.6285 41.1088Z"
              fill="#F2C94C"/>
    </svg>
);

// History/Scroll icon - Brown/tan for historical documents
export const HistoryIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M8 59.2121L8 15.9281C9.41773 15.6365 10.8507 15.4136 12.2934 15.2609C18.5544 14.5985 24.9012 15.2679 30.8945 17.2281C34.0819 18.2706 37.1351 19.6653 40 21.3809L40 64.6649C37.1351 62.9493 34.0819 61.5546 30.8945 60.5121C24.9012 58.5519 18.5544 57.8825 12.2934 58.5449C10.8507 58.6976 9.41773 58.9206 8 59.2121Z"
              fill="#219653"/>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M72 59.2121L72 15.9281C70.5823 15.6365 69.1493 15.4136 67.7066 15.2609C61.4456 14.5985 55.0988 15.2679 49.1055 17.2281C45.9181 18.2706 42.8649 19.6653 40 21.3809L40 64.6649C42.8649 62.9493 45.9181 61.5546 49.1055 60.5121C55.0988 58.5519 61.4456 57.8825 67.7066 58.5449C69.1493 58.6976 70.5823 58.9206 72 59.2121Z"
              fill="#6FCF97"/>
    </svg>
);

// Settings/Gear icon - Blue/teal for utility
export const SettingsIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M33.0234 14.2028C33.0923 13.3383 33.7093 12.6095 34.5624 12.4533C37.8654 11.8486 41.2534 11.8489 44.5563 12.4543C45.4092 12.6107 46.026 13.3394 46.0949 14.2038L46.4658 18.8603C46.5283 19.6444 47.048 20.311 47.7705 20.6219C48.5128 20.9413 49.241 21.3059 49.951 21.7158C50.6613 22.1259 51.3415 22.5745 51.9896 23.0579C52.62 23.5282 53.4573 23.6451 54.1676 23.3071L58.3833 21.3013C59.1665 20.9286 60.1063 21.0986 60.668 21.7593C62.8432 24.3178 64.5368 27.2524 65.6638 30.4159C65.9548 31.2326 65.632 32.1311 64.9179 32.6229L61.0737 35.2703C60.4259 35.7164 60.1085 36.4999 60.2005 37.281C60.295 38.0834 60.3433 38.8962 60.3433 39.7158C60.3433 40.5359 60.295 41.349 60.2003 42.1519C60.1083 42.933 60.4257 43.7165 61.0735 44.1626L64.9158 46.8087C65.63 47.3006 65.9527 48.1993 65.6615 49.0162C64.5337 52.1795 62.8393 55.1139 60.6632 57.672C60.1014 58.3324 59.1618 58.5022 58.3788 58.1297L54.1664 56.1254C53.4562 55.7874 52.619 55.9042 51.9885 56.3745C51.3408 56.8577 50.6609 57.3059 49.951 57.7158C49.241 58.1257 48.5129 58.4903 47.7706 58.8097C47.0481 59.1206 46.5284 59.7872 46.4659 60.5713L46.0955 65.2217C46.0266 66.0861 45.4098 66.8148 44.557 66.9712C41.2536 67.5768 37.8652 67.5771 34.5617 66.9722C33.7087 66.816 33.0917 66.0872 33.0228 65.2227L32.6523 60.5716C32.5899 59.7876 32.0701 59.1209 31.3475 58.8101C30.605 58.4906 29.8766 58.1259 29.1664 57.7158C28.4565 57.306 27.7768 56.8578 27.1291 56.3747C26.4987 55.9045 25.6615 55.7877 24.9513 56.1256L20.7357 58.1314C19.9528 58.504 19.0133 58.3342 18.4514 57.6739C16.2753 55.1162 14.5807 52.1822 13.4526 49.0192C13.1613 48.2024 13.484 47.3035 14.1983 46.8116L18.0439 44.1632C18.6917 43.717 19.0091 42.9335 18.9171 42.1524C18.8224 41.3494 18.7741 40.536 18.7741 39.7158C18.7741 38.896 18.8223 38.083 18.9169 37.2805C19.0089 36.4993 18.6915 35.7159 18.0437 35.2698L14.1961 32.62C13.482 32.1282 13.1592 31.2296 13.4503 30.4128C14.5776 27.2497 16.2713 24.3155 18.4466 21.7574C19.0084 21.0968 19.9481 20.9269 20.7312 21.2995L24.9501 23.3069C25.6603 23.6448 26.4976 23.528 27.1281 23.0577C27.776 22.5743 28.4561 22.1259 29.1664 21.7158C29.8766 21.3058 30.605 20.941 31.3477 20.6215C32.0702 20.3107 32.59 19.644 32.6524 18.8599L33.0234 14.2028ZM44.7545 30.7162C41.5391 28.8598 37.5775 28.8598 34.3622 30.7162C31.1468 32.5726 29.166 36.0034 29.166 39.7162C29.166 43.429 31.1468 46.8598 34.3622 48.7162C37.5775 50.5726 41.5391 50.5726 44.7545 48.7162C47.9698 46.8598 49.9506 43.429 49.9506 39.7162C49.9506 36.0034 47.9698 32.5726 44.7545 30.7162Z"
              fill="#2F80ED"/>
    </svg>
);

// Close/X icon - Muted red for dismiss
export const CloseIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" fill="#E8E0D8"/>
        <path
            d="M15 9l-6 6M9 9l6 6"
            stroke="#8B7355"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

// Send/Play icon - Green for positive action
export const SendIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} transform="rotate(90)">
        <path fillRule="evenodd" clipRule="evenodd"
              d="M41.789 14.3419C41.052 12.8678 38.9483 12.8678 38.2113 14.3419L13.4474 63.8697C12.7825 65.1995 13.7495 66.7642 15.2362 66.7642L33.9993 66.7642L39.9993 42.7642L45.9993 66.7642L64.7641 66.7642C66.2509 66.7642 67.2178 65.1995 66.5529 63.8697L41.789 14.3419Z"
              fill="#6FCF97"/>
        <path
            d="M39.6521 13.2661V44.1527L33.9993 66.7642H15.2362C13.7495 66.7642 12.7825 65.1996 13.4474 63.8698L38.2113 14.3419C38.5194 13.7258 39.0662 13.3672 39.6521 13.2661Z"
            fill="#219653"/>
    </svg>
);

// Clear/Dismiss input icon - Neutral gray
export const ClearIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="9" fill="#D4DCD6"/>
        <path
            d="M15 9l-6 6M9 9l6 6"
            stroke="#6B7A6E"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

// Selection/Text icon - For selection context mode
export const SelectionIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="4" y="4" width="16" height="16" rx="2" fill="#E8F0EA" stroke="#4A7C54" strokeWidth="1.5"/>
        <path
            d="M7 8h10M7 12h10M7 16h6"
            stroke="#4A7C54"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <rect x="6" y="10" width="8" height="4" fill="#A3C4AC" fillOpacity="0.5"/>
    </svg>
);

// Full page icon - For full page context mode
export const FullPageIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="4" y="2" width="16" height="20" rx="2" fill="#E8F0EA" stroke="#4A7C54" strokeWidth="1.5"/>
        <path
            d="M7 6h10M7 10h10M7 14h10M7 18h6"
            stroke="#4A7C54"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </svg>
);

// No context icon - Disabled state
export const NoContextIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="9" fill="#F0F2EF" stroke="#B8C4BC" strokeWidth="1.5"/>
        <path
            d="M8 12h8"
            stroke="#8A9A8C"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

// Copy icon - For clipboard copy actions
export const CopyIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="8" y="8" width="12" height="12" rx="2" fill="#E8F3F5" stroke="#3A7B89" strokeWidth="1.5"/>
        <path
            d="M16 8V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2"
            stroke="#5BA3B0"
            strokeWidth="1.5"
        />
    </svg>
);

// User icon - For user avatar in chat messages
export const UserIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path
            d="M48.4 71.9999L11.6 71.9999C9.61178 71.9999 8 70.3881 8 68.3999C8 62.452 11.7089 57.1351 17.2909 55.081L18.7054 54.5605C25.9962 51.8776 34.0038 51.8776 41.2946 54.5605L42.7091 55.081C48.2911 57.1351 52 62.452 52 68.3999C52 70.3881 50.3882 71.9999 48.4 71.9999Z"
            fill="#EB5757"/>
        <path
            d="M24.4715 44.0116C27.9486 45.7652 32.0514 45.7652 35.5285 44.0116C38.8318 42.3456 41.2077 39.2788 41.9955 35.664L42.1437 34.9842C42.9441 31.3115 42.0932 27.4725 39.816 24.4819L39.5802 24.1723C37.3028 21.1815 33.7592 19.4259 30 19.4259C26.2408 19.4259 22.6972 21.1815 20.4198 24.1723L20.184 24.4819C17.9068 27.4725 17.0559 31.3115 17.8563 34.9842L18.0045 35.664C18.7923 39.2788 21.1682 42.3456 24.4715 44.0116Z"
            fill="#EB5757"/>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M52 8C49.7909 8 48 9.79087 48 12V22.8571C48 25.0663 49.7909 26.8571 52 26.8571H53.1429V32L60 26.8571H68C70.2091 26.8571 72 25.0663 72 22.8571V12C72 9.79086 70.2091 8 68 8L52 8Z"
              fill="#F2C94C"/>
    </svg>
);

// Robot icon - For AI/assistant avatar in chat messages
export const RobotIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="4" y="8" width="16" height="12" rx="2" fill="#4A7C54"/>
        <circle cx="9" cy="13" r="2" fill="#FFFFFF"/>
        <circle cx="15" cy="13" r="2" fill="#FFFFFF"/>
        <rect x="10" y="17" width="4" height="2" rx="1" fill="#A3C4AC"/>
        <path d="M12 4v4M10 4h4" stroke="#4A7C54" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

// Check/Success icon - For confirmation states
export const CheckIcon: React.FC<IconProps> = ({size = 20, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="9" fill="#E8F0EA" stroke="#4A7C54" strokeWidth="1.5"/>
        <path
            d="M8 12l3 3 5-6"
            stroke="#4A7C54"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
