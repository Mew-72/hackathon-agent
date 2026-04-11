import { useState, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
  Sparkles,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { formatTimestamp } from '../utils/helpers';
import './Sidebar.css';

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isCollapsed,
  onToggleCollapse,
  isLoading,
  mobileOpen,
  onMobileClose,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-close the mobile sidebar when the viewport widens past the mobile breakpoint
  useEffect(() => {
    if (!onMobileClose) return;
    const mql = window.matchMedia('(min-width: 769px)');
    const handleChange = (e) => {
      if (e.matches) onMobileClose();
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [onMobileClose]);

  const filteredChats = searchQuery
    ? chats.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;

  const handleSelectChat = (id) => {
    onSelectChat(id);
    if (onMobileClose) onMobileClose();
  };

  return (
    <>
      {/* Mobile backdrop — keyboard accessible so screen-reader/keyboard users can dismiss */}
      {mobileOpen && (
        <button
          type="button"
          className="mobile-backdrop"
          aria-label="Close sidebar"
          onClick={onMobileClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onMobileClose();
            }
          }}
        />
      )}

      <aside className={`sidebar glass ${isCollapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Sparkles size={18} />
            </div>
            <span className="brand-text">Synapse AI</span>
          </div>
        )}
        <button className="sidebar-collapse-btn" onClick={onToggleCollapse} title={isCollapsed ? 'Expand' : 'Collapse'}>
          <ChevronLeft size={18} className={isCollapsed ? 'rotate-180' : ''} />
        </button>
      </div>

      {/* New Chat */}
      <div className="sidebar-new-chat">
        <button className="new-chat-btn" onClick={onNewChat}>
          <Plus size={16} />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Search */}
          <div className="sidebar-search">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search chats…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Chat list */}
          <div className="sidebar-chat-list">
            {isLoading && (
              <div className="sidebar-loading">
                <Loader2 size={20} className="spin" />
                <span>Loading chats…</span>
              </div>
            )}

            {!isLoading && filteredChats.length === 0 && (
              <div className="sidebar-empty">
                <MessageSquare size={20} />
                <span>{searchQuery ? 'No matches' : 'No chats yet'}</span>
              </div>
            )}

            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${chat.id === activeChatId ? 'chat-item-active' : ''}`}
                onClick={() => handleSelectChat(chat.id)}
              >
                <div className="chat-item-content">
                  <span className="chat-item-title truncate">{chat.title}</span>
                  <span className="chat-item-meta">
                    {formatTimestamp(chat.updatedAt)}
                    {chat.messageCount > 0 && ` · ${chat.messageCount} msgs`}
                  </span>
                </div>
                <button
                  className="chat-item-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  title="Delete chat"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
    </>
  );
}
