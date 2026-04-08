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
    const role = event.content?.role || event.role || event.author;
    if (role === 'user') {
      const parts = event.content?.parts || event.parts || [];
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
 * Convert an ADK timestamp to an ISO string.
 * ADK may return timestamps as Unix epoch floats (seconds) or ISO strings.
 */
function toISOTimestamp(ts) {
  if (!ts) return new Date().toISOString();
  if (typeof ts === 'number') {
    // Unix epoch in seconds (possibly fractional) → milliseconds
    return new Date(ts * 1000).toISOString();
  }
  // Already a string — validate it parses, otherwise return now
  const d = new Date(ts);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/**
 * Normalize a session object from the ADK backend into our sidebar-friendly format.
 * ADK session shape: { id, app_name, user_id, state, events, create_time, update_time, ... }
 */


/**
 * Normalizes an array of session objects.
 */
export const chatStore = {
  getCache() {
    try {
      return JSON.parse(localStorage.getItem('workspace_ai_chats') || '{}');
    } catch {
      return {};
    }
  },

  removeFromCache(sessionId) {
    const cache = this.getCache();
    if (cache[sessionId]) {
      delete cache[sessionId];
      localStorage.setItem('workspace_ai_chats', JSON.stringify(cache));
    }
  },

  saveTitlesToCache(chats) {
    if (!chats) return;
    const cache = this.getCache();
    let updated = false;
    chats.forEach(c => {
      // Only cache valid non-default titles
      if (c.title && c.title !== 'New Chat') {
        cache[c.id] = c.title;
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem('workspace_ai_chats', JSON.stringify(cache));
    }
  },

  /**
   * Convert a list of raw ADK sessions into sidebar-renderable chat items.
   * @param {Array} sessions — raw session objects from listSessions()
   */
  normalizeSessions(sessions) {
    if (!sessions || !Array.isArray(sessions)) return [];
    const cache = this.getCache();
    
    return sessions
      .map((session) => {
        // extract string from events
        let title = extractTitleFromEvents(session.events) || 'New Chat';
        
        // If the backend returned "New Chat" (because events is stripped out in list API),
        // try to recover the title from our localstorage cache.
        if (title === 'New Chat' && cache[session.id]) {
          title = cache[session.id];
        }

        return {
          id: session.id,
          sessionId: session.id,
          title,
          // Handle backend fields: lastUpdateTime, createTime
          createdAt: toISOTimestamp(session.createTime || session.create_time || session.createdAt),
          updatedAt: toISOTimestamp(session.lastUpdateTime || session.update_time || session.updatedAt),
          messageCount: session.events?.length || 0,
        };
      })
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
