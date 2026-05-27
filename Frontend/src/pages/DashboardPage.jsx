import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus, FiArrowRight, FiCode, FiClock, FiTrash2,
  FiLogOut, FiUsers, FiHash, FiAlignLeft
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { roomsAPI } from "../services/api";
import { Avatar, LangBadge, OnlineDot, Spinner } from "../components/ui";
import { Navbar } from "../components/layout/Navbar";
import toast from "react-hot-toast";

const LANGS = ["javascript", "typescript", "python", "java", "cpp", "c", "go", "rust"];

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const DashboardPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joinId, setJoinId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", roomId: "", description: "", language: "javascript" });

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomsAPI.getMyRooms(token);
      if (data.success) setRooms(data.rooms);
    } catch { toast.error("Failed to load rooms"); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.roomId) return toast.error("Room name and ID are required");
    setCreating(true);
    try {
      const data = await roomsAPI.create(token, form);
      if (data.success) {
        toast.success("Room created!");
        setShowCreate(false);
        setForm({ name: "", roomId: "", description: "", language: "javascript" });
        navigate(`/room/${data.room.roomId}`);
      } else {
        toast.error(data.message);
      }
    } catch { toast.error("Failed to create room"); }
    finally { setCreating(false); }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinId.trim()) return toast.error("Enter a room ID");
    navigate(`/room/${joinId.trim().toLowerCase()}`);
  };

  const handleDelete = async (roomId, e) => {
    e.stopPropagation();
    if (!confirm("Delete this room? This cannot be undone.")) return;
    try {
      const data = await roomsAPI.deleteRoom(token, roomId);
      if (data.success) {
        setRooms(rooms.filter((r) => r.roomId !== roomId));
        toast.success("Room deleted");
      } else {
        toast.error(data.message);
      }
    } catch { toast.error("Failed to delete room"); }
  };

  // Auto-generate room ID from name
  const handleNameChange = (name) => {
    setForm({
      ...form,
      name,
      roomId: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--cc-bg)" }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <Avatar username={user?.username} color={user?.color} size={48} />
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: "var(--cc-text)" }}
              >
                {user?.username}'s Workspace
              </h1>
              <p className="text-sm" style={{ color: "var(--cc-text-muted)" }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--cc-accent), var(--cc-accent-2))" }}
          >
            <FiPlus size={16} /> New Room
          </button>
        </div>

        {/* Create Room Modal */}
        {showCreate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl p-6 glass"
              style={{ border: "1px solid var(--cc-border-hover)" }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--cc-text)" }}>
                Create New Room
              </h2>
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <InputField
                  label="Room Name"
                  icon={<FiCode size={14} />}
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="My Awesome Project"
                />
                <InputField
                  label="Room ID (URL slug)"
                  icon={<FiHash size={14} />}
                  value={form.roomId}
                  onChange={(v) => setForm({ ...form, roomId: v.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  placeholder="my-awesome-project"
                  mono
                />
                <InputField
                  label="Description (optional)"
                  icon={<FiAlignLeft size={14} />}
                  value={form.description}
                  onChange={(v) => setForm({ ...form, description: v })}
                  placeholder="What are you building?"
                />
                <div>
                  <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--cc-text-muted)" }}>
                    Language
                  </label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                    style={{
                      background: "var(--cc-surface-2)",
                      border: "1px solid var(--cc-border)",
                      color: "var(--cc-text)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 rounded-xl text-sm glass"
                    style={{ color: "var(--cc-text-muted)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, var(--cc-accent), var(--cc-accent-2))" }}
                  >
                    {creating ? "Creating..." : "Create Room →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rooms list */}
          <div className="lg:col-span-2">
            <h2
              className="text-sm font-bold tracking-widest uppercase mb-4"
              style={{ color: "var(--cc-text-muted)", fontFamily: "var(--font-mono)" }}
            >
              Your Rooms ({rooms.length})
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size={32} />
              </div>
            ) : rooms.length === 0 ? (
              <div
                className="text-center py-20 rounded-2xl glass"
                style={{ border: "1px dashed var(--cc-border-hover)" }}
              >
                <FiCode size={40} style={{ color: "var(--cc-text-dim)", margin: "0 auto 12px" }} />
                <p className="font-semibold mb-2" style={{ color: "var(--cc-text-muted)" }}>
                  No rooms yet
                </p>
                <p className="text-sm mb-6" style={{ color: "var(--cc-text-dim)" }}>
                  Create your first room to start collaborating
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-white"
                  style={{ background: "var(--cc-accent)" }}
                >
                  Create Room
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {rooms.map((room) => (
                  <div
                    key={room._id}
                    onClick={() => navigate(`/room/${room.roomId}`)}
                    className="group p-5 rounded-2xl glass cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                    style={{ border: "1px solid var(--cc-border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--cc-border-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--cc-border)")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className="font-bold truncate"
                            style={{ color: "var(--cc-text)", fontFamily: "var(--font-display)" }}
                          >
                            {room.name}
                          </h3>
                          <LangBadge lang={room.language} />
                        </div>
                        <p
                          className="text-xs mb-3 truncate"
                          style={{ color: "var(--cc-text-muted)", fontFamily: "var(--font-mono)" }}
                        >
                          /room/{room.roomId}
                        </p>
                        {room.description && (
                          <p className="text-sm mb-3 truncate" style={{ color: "var(--cc-text-muted)" }}>
                            {room.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs" style={{ color: "var(--cc-text-dim)" }}>
                          <span className="flex items-center gap-1">
                            <FiClock size={11} /> {timeAgo(room.lastActivity)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiUsers size={11} /> {room.collaborators?.length || 1} member{(room.collaborators?.length || 1) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {room.owner?._id === user?.id && (
                          <button
                            onClick={(e) => handleDelete(room.roomId, e)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all"
                            style={{ color: "var(--cc-red)" }}
                            title="Delete room"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                        <div
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all"
                          style={{ color: "var(--cc-accent)" }}
                        >
                          <FiArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Join Room */}
            <div className="p-6 rounded-2xl glass">
              <h3
                className="font-bold mb-4"
                style={{ color: "var(--cc-text)", fontFamily: "var(--font-display)" }}
              >
                Join a Room
              </h3>
              <form onSubmit={handleJoin} className="flex flex-col gap-3">
                <input
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  placeholder="room-id or link"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--cc-surface-2)",
                    border: "1px solid var(--cc-border)",
                    color: "var(--cc-text)",
                    fontFamily: "var(--font-mono)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--cc-accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--cc-border)")}
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
                  style={{ background: "var(--cc-accent)" }}
                >
                  <FiArrowRight size={14} /> Join Room
                </button>
              </form>
            </div>

            {/* Profile Card */}
            <div className="p-6 rounded-2xl glass">
              <h3
                className="font-bold mb-4"
                style={{ color: "var(--cc-text)", fontFamily: "var(--font-display)" }}
              >
                Profile
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar username={user?.username} color={user?.color} size={44} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--cc-text)" }}>{user?.username}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <OnlineDot online />
                    <span className="text-xs" style={{ color: "var(--cc-green)" }}>Online</span>
                  </div>
                </div>
              </div>
              <div
                className="p-3 rounded-xl mb-4 text-xs"
                style={{ background: "var(--cc-surface-2)", fontFamily: "var(--font-mono)", color: "var(--cc-text-muted)" }}
              >
                Cursor: <span style={{ color: user?.color }}>■</span> {user?.color}
              </div>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{ color: "var(--cc-red)", border: "1px solid rgba(248,113,113,0.2)" }}
                onMouseEnter={(e) => (e.target.style.background = "rgba(248,113,113,0.1)")}
                onMouseLeave={(e) => (e.target.style.background = "transparent")}
              >
                <FiLogOut size={14} /> Sign out
              </button>
            </div>

            {/* Stats */}
            <div className="p-6 rounded-2xl glass">
              <h3
                className="font-bold mb-4"
                style={{ color: "var(--cc-text)", fontFamily: "var(--font-display)" }}
              >
                Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Rooms", val: rooms.length },
                  { label: "Languages", val: new Set(rooms.map((r) => r.language)).size },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: "var(--cc-surface-2)" }}>
                    <p className="text-2xl font-bold" style={{ color: "var(--cc-accent)", fontFamily: "var(--font-mono)" }}>{s.val}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--cc-text-muted)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const InputField = ({ label, icon, value, onChange, placeholder, mono }) => (
  <div>
    <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--cc-text-muted)" }}>
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cc-text-dim)" }}>
          {icon}
        </span>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-3 rounded-xl text-sm outline-none"
        style={{
          background: "var(--cc-surface-2)",
          border: "1px solid var(--cc-border)",
          color: "var(--cc-text)",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-display)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--cc-accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--cc-border)")}
      />
    </div>
  </div>
);

export default DashboardPage;
