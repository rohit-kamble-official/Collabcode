import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { io } from "socket.io-client";

import {
  FiCode,
  FiUsers,
  FiArrowLeft,
  FiCopy,
  FiCheck,
  FiMessageSquare,
  FiX,
  FiSend,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import { roomsAPI } from "../services/api";
import {
  Avatar,
  LangBadge,
  OnlineDot,
  Spinner
} from "../components/ui";

import toast from "react-hot-toast";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const CURSOR_COLORS = [
  "#7c6fff", "#ff6b9d", "#4ade80", "#fbbf24",
  "#06b6d4", "#f97316", "#a855f7", "#ec4899",
];

const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Room state
  const [room, setRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [users, setUsers] = useState([]);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);

  // Refs
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const providerRef = useRef(null);
  const ydocRef = useRef(null);
  const bindingRef = useRef(null);
  const autoSaveTimer = useRef(null);
  const chatEndRef = useRef(null);

  // User color assignment
  const myColor = useMemo(() => {
    if (user?.color) return user.color;
    return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
  }, [user]);

  // Load room info
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const data = await roomsAPI.getRoom(token, roomId);
        if (data.success) {
          setRoom(data.room);
          setLanguage(data.room.language || "javascript");
        } else {
          // Room might be new — allow joining anyway
          setRoom({ roomId, name: roomId, language: "javascript" });
        }
      } catch {
        setRoom({ roomId, name: roomId, language: "javascript" });
      } finally {
        setRoomLoading(false);
      }
    };
    loadRoom();
  }, [roomId, token]);

  // Socket + Yjs setup
  useEffect(() => {
    if (roomLoading) return;

    // Create Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Connect socket
    const socket = io("/", {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("room:join", {
        roomId,
        user: {
          id: user?.id,
          username: user?.username || "Guest",
          color: myColor,
        },
      });
    });

    socket.on("disconnect", () => setConnected(false));

    // Receive saved code from server on first join
    socket.on("room:code", ({ code, language: lang }) => {
      setLanguage(lang);
      // Only set initial content if editor is already mounted and doc is empty
      const yText = ydoc.getText("monaco");
      if (yText.toString() === "" && code) {
        yText.insert(0, code);
      }
    });

    socket.on("room:users", (u) => setUsers(u));

    socket.on("room:language", ({ language: lang }) => {
      setLanguage(lang);
    });

    socket.on("room:chat", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Yjs Socket.IO Provider (handles CRDT sync)
    const provider = new WebsocketProvider(
  "ws://localhost:1234",
  roomId,
  ydoc
);
    providerRef.current = provider;

    // Set local awareness state
    provider.awareness.setLocalStateField("user", {
      id: user?.id,
      username: user?.username || "Guest",
      color: myColor,
    });

    return () => {
      clearTimeout(autoSaveTimer.current);
      if (bindingRef.current) bindingRef.current.destroy();
      provider.disconnect();
      socket.emit("room:leave", { roomId });
      socket.disconnect();
      ydoc.destroy();
    };
  }, [roomLoading, roomId, token]);

  // Monaco mount handler
  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    if (!ydocRef.current) return;

    const yText = ydocRef.current.getText("monaco");
    const provider = providerRef.current;

    // Monaco-Yjs binding
    const binding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider?.awareness
    );
    bindingRef.current = binding;

    // Style awareness cursors
    if (provider) {
      provider.awareness.on("change", () => {
        const states = provider.awareness.getStates();
        states.forEach((state, clientId) => {
          if (clientId === provider.awareness.clientID) return;
          if (state.user?.color) {
            const style = document.getElementById(`cursor-style-${clientId}`) || (() => {
              const s = document.createElement("style");
              s.id = `cursor-style-${clientId}`;
              document.head.appendChild(s);
              return s;
            })();
            style.textContent = `
              .yRemoteSelection-${clientId} { background-color: ${state.user.color}33 !important; }
              .yRemoteSelectionHead-${clientId} { border-color: ${state.user.color} !important; border-width: 2px; }
              .yRemoteSelectionHead-${clientId}::after { content: '${state.user.username || ""}'; background: ${state.user.color}; color: white; font-size: 10px; padding: 1px 4px; border-radius: 2px; white-space: nowrap; }
            `;
          }
        });
      });
    }

    // Auto-save on content change (debounced)
    editor.onDidChangeModelContent(() => {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        const code = editor.getValue();
        socketRef.current?.emit("room:save", { roomId, code, language });
      }, 3000);
    });

    // Set font & options
    editor.updateOptions({
      fontFamily: "'Space Mono', monospace",
      fontSize: 14,
      lineHeight: 22,
      cursorBlinking: "smooth",
      smoothScrolling: true,
      minimap: { enabled: window.innerWidth > 1024 },
      scrollBeyondLastLine: false,
      padding: { top: 16, bottom: 16 },
    });
  }, [roomId, language]);

  // Language change
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    socketRef.current?.emit("room:language", { roomId, language: lang });
    // Persist to DB
    roomsAPI.saveCode(token, roomId, editorRef.current?.getValue() || "", lang);
  };

  // Manual save
  const handleManualSave = async () => {
    const code = editorRef.current?.getValue() || "";
    setSaving(true);
    try {
      await roomsAPI.saveCode(token, roomId, code, language);
      toast.success("Code saved!", { icon: "💾" });
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Copy room link
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Room link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Chat
  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socketRef.current?.emit("room:chat", {
      roomId,
      message: chatInput.trim(),
      user: { username: user?.username, color: myColor },
    });
    setChatInput("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (roomLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ background: "var(--cc-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <Spinner size={36} />
          <p style={{ color: "var(--cc-text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
            Connecting to room...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden" style={{ background: "var(--cc-bg)" }}>
      {/* Top Bar */}
      <header
        className="flex items-center gap-3 px-4 h-14 flex-shrink-0"
        style={{ background: "var(--cc-surface)", borderBottom: "1px solid var(--cc-border)" }}
      >
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-lg transition-all hover:opacity-70"
          style={{ color: "var(--cc-text-muted)" }}
        >
          <FiArrowLeft size={16} />
        </button>

        {/* Room name */}
        <div className="flex items-center gap-2 mr-auto min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--cc-accent), var(--cc-accent-2))" }}
          >
            <FiCode size={13} color="white" />
          </div>
          <span
            className="font-bold text-sm truncate"
            style={{ color: "var(--cc-text)", fontFamily: "var(--font-display)" }}
          >
            {room?.name || roomId}
          </span>
          <span
            className="text-xs hidden sm:block flex-shrink-0"
            style={{ color: "var(--cc-text-dim)", fontFamily: "var(--font-mono)" }}
          >
            /room/{roomId}
          </span>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "" : "opacity-50"}`}
            style={{ background: connected ? "var(--cc-green)" : "var(--cc-text-dim)" }}
          />
          <span className="text-xs hidden sm:block" style={{ color: "var(--cc-text-muted)", fontFamily: "var(--font-mono)" }}>
            {connected ? "live" : "offline"}
          </span>
        </div>

        {/* Language selector */}
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="px-2 py-1.5 rounded-lg text-xs outline-none hidden sm:block"
          style={{
            background: "var(--cc-surface-2)",
            border: "1px solid var(--cc-border)",
            color: "var(--cc-text)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>

        {/* Save */}
        <button
          onClick={handleManualSave}
          disabled={saving}
          className="px-3 py-1.5 rounded-lg text-xs font-bold hidden sm:block transition-all hover:opacity-80"
          style={{ background: "var(--cc-surface-2)", color: "var(--cc-accent)", border: "1px solid var(--cc-accent)33" }}
        >
          {saving ? "Saving..." : "Save"}
        </button>

        {/* Share */}
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ background: "var(--cc-accent)22", color: "var(--cc-accent)" }}
        >
          {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
          <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
        </button>

        {/* Chat toggle */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="p-2 rounded-lg relative"
          style={{ color: chatOpen ? "var(--cc-accent)" : "var(--cc-text-muted)" }}
        >
          <FiMessageSquare size={16} />
          {messages.length > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center"
              style={{ background: "var(--cc-accent)", color: "white", fontSize: 9 }}
            >
              {messages.length > 9 ? "9+" : messages.length}
            </span>
          )}
        </button>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg"
          style={{ color: sidebarOpen ? "var(--cc-accent)" : "var(--cc-text-muted)" }}
        >
          {sidebarOpen ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          {/* Mobile language bar */}
          <div
            className="sm:hidden flex items-center gap-2 px-3 py-2"
            style={{ background: "var(--cc-surface-2)", borderBottom: "1px solid var(--cc-border)" }}
          >
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="flex-1 px-2 py-1 rounded text-xs outline-none"
              style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", color: "var(--cc-text)", fontFamily: "var(--font-mono)" }}
            >
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <button onClick={handleManualSave} className="px-2 py-1 rounded text-xs" style={{ color: "var(--cc-accent)" }}>
              Save
            </button>
          </div>

          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            onMount={handleEditorMount}
            loading={
              <div className="h-full w-full flex items-center justify-center" style={{ background: "#1e1e1e" }}>
                <Spinner />
              </div>
            }
            options={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 14,
              minimap: { enabled: false },
            }}
          />
        </div>

        {/* Sidebar - Users */}
        {sidebarOpen && (
          <aside
            className="w-56 flex-shrink-0 flex flex-col overflow-hidden"
            style={{ background: "var(--cc-surface)", borderLeft: "1px solid var(--cc-border)" }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--cc-border)" }}
            >
              <div className="flex items-center gap-2">
                <FiUsers size={13} style={{ color: "var(--cc-text-muted)" }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--cc-text-muted)", fontFamily: "var(--font-mono)" }}>
                  Online ({users.length})
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {users.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: "var(--cc-text-dim)" }}>
                  No users yet
                </p>
              ) : (
                users.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl"
                    style={{ background: "var(--cc-surface-2)" }}
                  >
                    <Avatar username={u.username} color={u.color || CURSOR_COLORS[i % CURSOR_COLORS.length]} size={28} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--cc-text)" }}>
                        {u.username}
                        {u.username === user?.username && (
                          <span style={{ color: "var(--cc-text-dim)" }}> (you)</span>
                        )}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <OnlineDot online />
                        <span className="text-xs" style={{ color: "var(--cc-green)", fontFamily: "var(--font-mono)" }}>live</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Room info */}
            <div
              className="p-3"
              style={{ borderTop: "1px solid var(--cc-border)" }}
            >
              <div className="p-3 rounded-xl" style={{ background: "var(--cc-surface-2)" }}>
                <p className="text-xs mb-1.5 font-semibold" style={{ color: "var(--cc-text-muted)" }}>Language</p>
                <LangBadge lang={language} />
              </div>
            </div>
          </aside>
        )}

        {/* Chat Panel */}
        {chatOpen && (
          <div
            className="w-72 flex-shrink-0 flex flex-col"
            style={{ background: "var(--cc-surface)", borderLeft: "1px solid var(--cc-border)" }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--cc-border)" }}
            >
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--cc-text-muted)", fontFamily: "var(--font-mono)" }}>
                Chat
              </span>
              <button onClick={() => setChatOpen(false)} style={{ color: "var(--cc-text-muted)" }}>
                <FiX size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              {messages.length === 0 ? (
                <p className="text-xs text-center py-8" style={{ color: "var(--cc-text-dim)" }}>
                  No messages yet. Say hi!
                </p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: msg.user.color || "var(--cc-accent)" }}>
                        {msg.user.username}
                      </span>
                      <span className="text-xs" style={{ color: "var(--cc-text-dim)", fontFamily: "var(--font-mono)" }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p
                      className="text-sm px-3 py-2 rounded-xl"
                      style={{ background: "var(--cc-surface-2)", color: "var(--cc-text)", wordBreak: "break-word" }}
                    >
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={sendChat}
              className="p-3 flex gap-2"
              style={{ borderTop: "1px solid var(--cc-border)" }}
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: "var(--cc-surface-2)",
                  border: "1px solid var(--cc-border)",
                  color: "var(--cc-text)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--cc-accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--cc-border)")}
              />
              <button
                type="submit"
                className="p-2 rounded-xl"
                style={{ background: "var(--cc-accent)", color: "white" }}
              >
                <FiSend size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;
