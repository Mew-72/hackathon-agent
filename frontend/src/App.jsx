import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import VoiceOverlay from './components/VoiceOverlay';
import { useChat } from './hooks/useChat';
import { useVoice } from './hooks/useVoice';
import './App.css';

export default function App() {
  const {
    chats,
    activeChatId,
    messages,
    isStreaming,
    isLoadingSessions,
    loadChat,
    createNewChat,
    deleteChat,
    sendMessage,
    stopStreaming,
  } = useChat();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  const handleSend = useCallback(
    (text, files = []) => {
      if (!text && files.length === 0) return;
      sendMessage(text, files);
    },
    [sendMessage]
  );

  const handleVoiceTranscript = useCallback(
    ({ base64, mimeType }) => {
      sendMessage('[Voice message sent]', [
        { name: 'voice.webm', mimeType, data: base64, size: 0 },
      ]);
    },
    [sendMessage]
  );

  // Browser TTS
  const handleSpeak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleaned = text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[|>-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={loadChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isLoading={isLoadingSessions}
      />

      <ChatView
        messages={messages}
        isStreaming={isStreaming}
        onSend={handleSend}
        onStop={stopStreaming}
        onVoiceClick={() => setVoiceOpen(true)}
        onSpeak={handleSpeak}
      />

      <VoiceOverlay
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onTranscript={handleVoiceTranscript}
      />
    </div>
  );
}
