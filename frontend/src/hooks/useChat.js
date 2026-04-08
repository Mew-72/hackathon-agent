import { useState, useCallback, useRef, useEffect } from 'react';
import {
  createSession,
  listSessions,
  getSession,
  deleteSession,
  parseSessionEvents,
  streamMessage,
  mockStreamMessage,
} from '../api/agentClient';
import { chatStore } from '../store/chatStore';
import { generateId } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'; // default to real mode

export function useChat() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null); // sessionId
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const abortRef = useRef(null);

  // Track locally created sessions that might not yet be on the server
  const localSessionIdsRef = useRef(new Set());
  // Track active load operations to avoid stale overwrites
  const loadSeqRef = useRef(0);
  // Track if currently streaming to guard against chat-list overwrites
  const isStreamingRef = useRef(false);

  /* ─── 4. Sidebar loads → fetch sessions from backend ─────────── */
  const refreshChats = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const sessions = await listSessions();
      const normalized = chatStore.normalizeSessions(sessions);

      // Merge with locally created sessions that the server might not know about yet
      setChats((prev) => {
        const serverIds = new Set(normalized.map((s) => s.id));
        // Build a map of the previous local state so we can preserve local titles
        const prevMap = new Map(prev.map((c) => [c.id, c]));

        // Keep any local-only sessions that aren't on the server yet
        const localOnly = prev.filter(
          (c) => localSessionIdsRef.current.has(c.id) && !serverIds.has(c.id)
        );

        // For server sessions, preserve the local title if server still says "New Chat"
        const mergedServer = normalized.map((s) => {
          const local = prevMap.get(s.id);
          if (local && local.title !== 'New Chat' && s.title === 'New Chat') {
            return { ...s, title: local.title };
          }
          return s;
        });

        // Merge: local-only first (newest), then server sessions
        const merged = [...localOnly, ...mergedServer];
        // De-duplicate by id, keeping the first occurrence
        const seen = new Set();
        const finalChats = merged.filter((c) => {
          if (seen.has(c.id)) return false;
          seen.add(c.id);
          return true;
        });

        chatStore.saveTitlesToCache(finalChats);
        return finalChats;
      });
    } catch (err) {
      console.error('Failed to load sessions:', err);
      // Keep whatever we have in state — don't clobber local chats
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  /* ─── 5. User clicks an old chat → load full history from backend ── */
  const loadChat = useCallback(async (sessionId) => {
    // Increment sequence to invalidate any concurrent in-flight loads
    const seq = ++loadSeqRef.current;

    setActiveChatId(sessionId);
    setMessages([]); // Clear while loading

    try {
      const session = await getSession(sessionId);

      // If another load or send started while we were fetching, bail out
      if (loadSeqRef.current !== seq) return;

      const parsed = parseSessionEvents(session.events);
      setMessages(parsed);
    } catch (err) {
      // Only set error if this is still the active load
      if (loadSeqRef.current !== seq) return;

      console.error('Failed to load session history:', err);
      setMessages([
        {
          id: generateId(),
          role: 'assistant',
          content: `Failed to load conversation history: ${err.message}`,
          thoughts: [],
          toolCalls: [],
          timestamp: new Date().toISOString(),
          isStreaming: false,
          isError: true,
        },
      ]);
    }
  }, []);

  /* ─── 2. New chat button → create session via API ────────────── */
  const createNewChat = useCallback(async () => {
    const sessionId = uuidv4();

    // Invalidate any in-flight loadChat
    loadSeqRef.current++;

    // Track this as a local session so refreshChats won't remove it
    localSessionIdsRef.current.add(sessionId);

    // Optimistically add to UI first (don't wait for API)
    setActiveChatId(sessionId);
    setMessages([]);
    setChats((prev) => [
      {
        id: sessionId,
        sessionId,
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      },
      ...prev,
    ]);

    // Create session on backend (fire and forget — backend also auto-creates on first message)
    try {
      await createSession(sessionId);
    } catch (err) {
      console.error('Failed to create session:', err);
    }

    return { id: sessionId, sessionId };
  }, []);

  /* ─── Delete chat (local + backend) ── */
  const deleteChat = useCallback(
    async (sessionId) => {
      localSessionIdsRef.current.delete(sessionId);
      setChats((prev) => prev.filter((c) => c.id !== sessionId));
      chatStore.removeFromCache(sessionId);
      if (activeChatId === sessionId) {
        setActiveChatId(null);
        setMessages([]);
      }

      try {
        await deleteSession(sessionId);
      } catch (err) {
        console.error('Failed to delete session on backend:', err);
      }
    },
    [activeChatId]
  );

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current();
      abortRef.current = null;
    }
    setIsStreaming(false);
    isStreamingRef.current = false;
  }, []);

  /* ─── 3. User sends a message → POST /run_sse ───────────────── */
  const sendMessage = useCallback(
    async (text, files = []) => {
      let sessionId = activeChatId;

      // Invalidate any in-flight loadChat so it doesn't overwrite our messages
      loadSeqRef.current++;

      // If no active session, create one first
      if (!sessionId) {
        const newSession = await createNewChat();
        sessionId = newSession.sessionId;
      }

      // Add user message to local state
      const userMsg = {
        id: generateId(),
        role: 'user',
        content: text,
        files: files.map((f) => ({ name: f.name, size: f.size, type: f.mimeType })),
        timestamp: new Date().toISOString(),
        isStreaming: false,
      };

      // Create placeholder assistant message
      const assistantMsgId = generateId();
      const assistantMsg = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        thoughts: [],
        toolCalls: [],
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      isStreamingRef.current = true;

      // Update sidebar title from first message
      if (text) {
        setChats((prev) => {
          const updated = prev.map((c) =>
            c.id === sessionId && c.title === 'New Chat'
              ? { ...c, title: chatStore.generateTitle(text), updatedAt: new Date().toISOString() }
              : c
          );
          chatStore.saveTitlesToCache(updated);
          return updated;
        });
      }

      const streamFn = USE_MOCK ? mockStreamMessage : streamMessage;

      const abort = streamFn({
        sessionId,
        message: text,
        files,

        onThought(thought) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, thoughts: [...(m.thoughts || []), thought] }
                : m
            )
          );
        },

        onToolCall(tc) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    toolCalls: [
                      ...(m.toolCalls || []),
                      { ...tc, status: 'running', result: null },
                    ],
                  }
                : m
            )
          );
        },

        onToolResult(tr) {
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== assistantMsgId) return m;
              const toolCalls = (m.toolCalls || []).map((tc) =>
                tc.id === tr.id || tc.name === tr.name
                  ? { ...tc, status: 'complete', result: tr.result }
                  : tc
              );
              return { ...m, toolCalls };
            })
          );
        },

        onText(text) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: text } : m
            )
          );
        },

        onError(err) {
          if (err.message && (err.message.includes('Unexpected end of JSON input') || err.message.includes('fetch failed') || err.message.includes('NetworkError'))) {
            console.warn('Ignoring benign stream termination error:', err);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, isStreaming: false } : m
              )
            );
            setIsStreaming(false);
            isStreamingRef.current = false;
            abortRef.current = null;
            localSessionIdsRef.current.delete(sessionId);
            refreshChats();
            return;
          }

          console.error('Stream error:', err);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: m.content || `Error: ${err.message}`,
                    isStreaming: false,
                    isError: true,
                  }
                : m
            )
          );
          setIsStreaming(false);
          isStreamingRef.current = false;
          abortRef.current = null;
        },

        onDone() {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, isStreaming: false } : m
            )
          );
          setIsStreaming(false);
          isStreamingRef.current = false;
          abortRef.current = null;

          // Remove from local-only tracking since server now knows about this session
          localSessionIdsRef.current.delete(sessionId);

          // Refresh sidebar to get updated timestamps
          refreshChats();
        },
      });

      abortRef.current = abort;
    },
    [activeChatId, createNewChat, refreshChats]
  );

  return {
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
    refreshChats,
  };
}
