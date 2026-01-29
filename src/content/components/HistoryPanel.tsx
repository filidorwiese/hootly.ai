import React from 'react';
import { css } from '@emotion/css';
import type { Conversation } from '../../shared/types';
import { t } from '../../shared/i18n';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (id: string) => void;
  currentConversationId: string | null;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  conversations,
  onSelectConversation,
  onDeleteConversation,
  currentConversationId,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return t('history.yesterday');
    } else if (diffDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const sortedConversations = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className={panelStyles}>
      <div className={panelHeaderStyles}>
        <h3>{t('history.title')}</h3>
        <button onClick={onClose} aria-label={t('dialog.close')}>✕</button>
      </div>
      <div className={panelContentStyles}>
        {sortedConversations.length === 0 ? (
          <div className={emptyStateStyles}>
            <span className={emptyIconStyles}>📭</span>
            <p>{t('history.empty')}</p>
          </div>
        ) : (
          <ul className={conversationListStyles}>
            {sortedConversations.map((conv) => (
              <li
                key={conv.id}
                className={`${conversationItemStyles} ${conv.id === currentConversationId ? activeItemStyles : ''}`}
              >
                <button
                  className={conversationButtonStyles}
                  onClick={() => onSelectConversation(conv)}
                >
                  <span className={conversationTitleStyles}>{conv.title}</span>
                  <div className={conversationMetaStyles}>
                    <span>{formatDate(conv.updatedAt)}</span>
                    <span className={messageBadgeStyles}>
                      {t('history.messages', { count: conv.messages.length })}
                    </span>
                  </div>
                </button>
                <button
                  className={deleteButtonStyles}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  aria-label={t('history.delete')}
                  title={t('history.delete')}
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const panelStyles = css`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background: #FAFBF9;
  border-left: 1px solid #E4E8E2;
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: -4px 0 12px rgba(45, 60, 48, 0.08);
`;

const panelHeaderStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(to bottom, #F5F7F4, #FAFBF9);
  border-bottom: 1px solid #E4E8E2;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #2D3A30;
  }

  button {
    background: transparent;
    border: none;
    font-size: 14px;
    color: #6B7A6E;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.15s ease;

    &:hover {
      background: rgba(58, 90, 64, 0.08);
      color: #3A5A40;
    }
  }
`;

const panelContentStyles = css`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const emptyStateStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;

  p {
    margin: 0;
    color: #8A9A8C;
    font-size: 13px;
  }
`;

const emptyIconStyles = css`
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.6;
`;

const conversationListStyles = css`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const conversationItemStyles = css`
  display: flex;
  align-items: center;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(58, 90, 64, 0.06);
  }
`;

const activeItemStyles = css`
  background: rgba(58, 90, 64, 0.12);

  &:hover {
    background: rgba(58, 90, 64, 0.15);
  }
`;

const conversationButtonStyles = css`
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  min-width: 0;
`;

const conversationTitleStyles = css`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #2D3A30;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
`;

const conversationMetaStyles = css`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #8A9A8C;
`;

const messageBadgeStyles = css`
  background: rgba(58, 90, 64, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
`;

const deleteButtonStyles = css`
  background: transparent;
  border: none;
  font-size: 14px;
  color: #8A9A8C;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.15s ease;

  ${conversationItemStyles}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(200, 80, 80, 0.1);
    color: #c85050;
  }
`;

export default HistoryPanel;
