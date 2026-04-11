import { useRef, useEffect } from 'react';
import {
  Calendar,
  Mail,
  CheckSquare,
  FileText,
  Search,
  Sparkles,
  Menu,
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import './ChatView.css';

const DEFAULT_PLANT = import.meta.env.VITE_USER_EMAIL || "Ask me for my email!\n"
const SUGGESTIONS = [
  { icon: Calendar, text: "Show my calendar for this week.", color: '#8b5cf6' },
  { icon: Mail, text: 'Summarize my unread emails.', color: '#06b6d4' },
  { icon: CheckSquare, text: 'List my pending tasks.', color: '#22c55e' },
  { icon: FileText, text: 'Create a meeting notes doc.', color: '#f59e0b' },
];

export default function ChatView({
  messages,
  isStreaming,
  onSend,
  onStop,
  onVoiceClick,
  onSpeak,
  onMenuClick,
}) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="chat-view">
      {/* Mobile top bar */}
      <div className="chat-mobile-header">
        <button
          className="chat-menu-btn"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="chat-mobile-brand">
          <Sparkles size={16} />
          <span>Synapse AI</span>
        </div>
      </div>
      {/* Messages area */}
      <div className="chat-messages" ref={scrollRef}>
        {isEmpty ? (
          <div className="chat-empty">
            <div className="empty-hero">
              <div className="empty-icon-ring">
                <div className="empty-icon">
                  <Sparkles size={32} />
                </div>
              </div>
              <h1 className="empty-title">Synapse AI</h1>
              <p className="empty-subtitle">
                Your intelligent productivity assistant for Google Workspace
              </p>
            </div>

            <div className="suggestions-grid">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-card glass"
                  onClick={() => onSend(DEFAULT_PLANT + "\n" + s.text)}
                >
                  <div
                    className="suggestion-icon"
                    style={{ background: `${s.color}18`, color: s.color }}
                  >
                    <s.icon size={18} />
                  </div>
                  <span className="suggestion-text">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} onSpeak={onSpeak} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <InputBar
        onSend={onSend}
        onVoiceClick={onVoiceClick}
        isStreaming={isStreaming}
        onStop={onStop}
      />
    </div>
  );
}
