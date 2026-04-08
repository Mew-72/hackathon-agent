import { Bot, User, Copy, Check, Volume2 } from 'lucide-react';
import { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import ThoughtBlock from './ThoughtBlock';
import ToolCallBlock from './ToolCallBlock';
import { formatTime } from '../utils/helpers';
import './MessageBubble.css';

export default function MessageBubble({ message, onSpeak }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    if (message.content) {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`message-row ${isUser ? 'message-user' : 'message-assistant'} animate-fade-in`}>
      {/* Avatar */}
      <div className={`message-avatar ${isUser ? 'avatar-user' : 'avatar-bot'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Content */}
      <div className="message-content-wrapper">
        {/* Role label */}
        <div className="message-meta">
          <span className="message-role">{isUser ? 'You' : 'Synapse AI'}</span>
          <span className="message-time">{formatTime(message.timestamp)}</span>
        </div>

        {/* Assistant-specific blocks */}
        {isAssistant && (
          <>
            <ThoughtBlock thoughts={message.thoughts} />

            {message.toolCalls?.map((tc, i) => (
              <ToolCallBlock key={tc.id || i} toolCall={tc} />
            ))}
          </>
        )}

        {/* Message body */}
        <div className={`message-bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}>
          {isUser ? (
            <p className="message-text-user">{message.content}</p>
          ) : message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : message.isStreaming ? (
            <div className="typing-indicator">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : null}

          {/* Streaming cursor */}
          {isAssistant && message.isStreaming && message.content && (
            <span className="streaming-cursor">▊</span>
          )}
        </div>

        {/* User attached files */}
        {isUser && message.files?.length > 0 && (
          <div className="message-files">
            {message.files.map((f, i) => (
              <span key={i} className="message-file-tag">📎 {f.name}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        {isAssistant && message.content && !message.isStreaming && (
          <div className="message-actions">
            <button className="msg-action-btn" onClick={handleCopy} title="Copy">
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            {onSpeak && (
              <button className="msg-action-btn" onClick={() => onSpeak(message.content)} title="Read aloud">
                <Volume2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
