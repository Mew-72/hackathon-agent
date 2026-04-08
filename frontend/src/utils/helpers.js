import { v4 as uuidv4 } from 'uuid';

export const generateId = () => uuidv4();

export const generateSessionId = () => uuidv4();

export const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const generateChatTitle = (firstMessage) => {
  if (!firstMessage) return 'New Chat';
  const text = firstMessage.trim();
  if (text.length <= 40) return text;
  return text.substring(0, 40).trim() + '…';
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const getToolIcon = (toolName) => {
  const name = (toolName || '').toLowerCase();
  if (name.includes('calendar')) return 'calendar';
  if (name.includes('gmail') || name.includes('mail') || name.includes('email')) return 'mail';
  if (name.includes('task')) return 'check-square';
  if (name.includes('doc')) return 'file-text';
  if (name.includes('drive')) return 'hard-drive';
  if (name.includes('search') || name.includes('google_search')) return 'search';
  return 'terminal';
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');
