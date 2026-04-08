/**
 * Chat Store — lightweight in-memory store that delegates persistence to the ADK backend.
 * Keeps a local cache of session metadata for sidebar rendering,
 * and manages the active session's messages in React state (via useChat hook).
 */

import { generateId } from '../utils/helpers';

/**
 * Parse a title from the first user message in a session's events.
 * @param {Array} events — the events array from a session response
 * @returns {string} — extracted title or 'New Chat'
 */
function extractTitleFromEvents(events) {
  if (!events || !Array.isArray(events)) return 'New Chat';
  for (const event of events) {
    if (event.role === 'user') {
      const parts = event.parts || event.content?.parts || [];
      const text = parts
        .filter((p) => p.text)
        .map((p) => p.text)
        .join('');
      if (text) {
        return text.length <= 40 ? text : text.substring(0, 40).trim() + '…';
      }
    }
  }
  return 'New Chat';
}

/**
 * Normalize a session object from the ADK backend into our sidebar-friendly format.
 * ADK session shape: { id, app_name, user_id, state, events, create_time, update_time, ... }
 */
function normalizeSession(session) {
  return {
    id: session.id,
    sessionId: session.id,
    title: extractTitleFromEvents(session.events) || 'New Chat',
    createdAt: session.create_time || session.createdAt || new Date().toISOString(),
    updatedAt: session.update_time || session.updatedAt || new Date().toISOString(),
    messageCount: session.events?.length || 0,
  };
}

export const chatStore = {
  /**
   * Convert a list of raw ADK sessions into sidebar-renderable chat items.
   * @param {Array} sessions — raw session objects from listSessions()
   * @returns {Array} — sorted list of chat metadata
   */
  normalizeSessions(sessions) {
    if (!sessions || !Array.isArray(sessions)) return [];
    return sessions
      .map(normalizeSession)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  /**
   * Generate a chat title from the first user message text.
   * @param {string} text
   * @returns {string}
   */
  generateTitle(text) {
    if (!text) return 'New Chat';
    const trimmed = text.trim();
    return trimmed.length <= 40 ? trimmed : trimmed.substring(0, 40).trim() + '…';
  },

  /**
   * Generate a unique ID for messages.
   */
  generateMessageId() {
    return generateId();
  },
};
