import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Paperclip, Mic, Square, ArrowUp } from 'lucide-react';
import FilePreview from './FilePreview';
import './InputBar.css';

export default function InputBar({
  onSend,
  onVoiceClick,
  isStreaming,
  onStop,
  disabled,
}) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [text]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;
    if (isStreaming) return;

    onSend(trimmed, files);
    setText('');
    setFiles([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, files, isStreaming, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = useCallback(async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const fileData = await Promise.all(
      selectedFiles.map(async (file) => {
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        const base64 = dataUrl.split(',')[1];
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          mimeType: file.type,
          data: base64,
          preview: file.type.startsWith('image/') ? dataUrl : null,
        };
      })
    );
    setFiles((prev) => [...prev, ...fileData]);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = (text.trim() || files.length > 0) && !isStreaming;

  return (
    <div className="input-bar-container">
      <div className="input-bar glass">
        <FilePreview files={files} onRemove={removeFile} />

        <div className="input-row">
          {/* File attach */}
          <button
            className="input-icon-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
            disabled={disabled}
          >
            <Paperclip size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden-file-input"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.txt,.csv,.json,.md,.doc,.docx"
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="input-textarea"
            placeholder="Message Synapse AI…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={disabled}
          />

          {/* Voice */}
          <button
            className="input-icon-btn voice-btn"
            onClick={onVoiceClick}
            title="Voice input"
            disabled={disabled}
          >
            <Mic size={18} />
          </button>

          {/* Send / Stop */}
          {isStreaming ? (
            <button className="send-btn stop-btn" onClick={onStop} title="Stop generating">
              <Square size={16} />
            </button>
          ) : (
            <button
              className={`send-btn ${canSend ? 'send-btn-active' : ''}`}
              onClick={handleSend}
              disabled={!canSend}
              title="Send message"
            >
              <ArrowUp size={18} />
            </button>
          )}
        </div>
      </div>
      <p className="input-disclaimer">
        Synapse AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
