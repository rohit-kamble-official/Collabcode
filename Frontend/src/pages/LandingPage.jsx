import { Link } from "react-router-dom";
import { FiCode, FiUsers, FiZap, FiLock, FiGlobe, FiSave } from "react-icons/fi";
import { Navbar } from "../components/layout/Navbar";

const FEATURES = [
  {
    icon: <FiUsers size={22} />,
    title: "Real-time Collaboration",
    desc: "Code with your team simultaneously. See cursors, selections, and edits live — powered by Yjs CRDT.",
    color: "#7c6fff",
  },
  {
    icon: <FiCode size={22} />,
    title: "8+ Languages",
    desc: "JavaScript, TypeScript, Python, Java, C++, Go, Rust, and more with full Monaco Editor support.",
    color: "#ff6b9d",
  },
  {
    icon: <FiZap size={22} />,
    title: "Room-Based Spaces",
    desc: "Create private rooms with shareable links. Each room persists your code for future sessions.",
    color: "#fbbf24",
  },
  {
    icon: <FiLock size={22} />,
    title: "Secure Auth",
    desc: "JWT authentication with bcrypt password hashing. Your code and sessions are protected.",
    color: "#4ade80",
  },
  {
    icon: <FiSave size={22} />,
    title: "Auto-Save",
    desc: "Never lose your work. Code auto-saves to MongoDB Atlas and restores on room reopen.",
    color: "#06b6d4",
  },
  {
    icon: <FiGlobe size={22} />,
    title: "Live Cursors",
    desc: "See exactly where each collaborator is. Named cursor labels with unique colors per user.",
    color: "#a855f7",
  },
];

const LandingPage = () => {
  return (
   <div
  className="min-h-screen w-full overflow-x-hidden grad-mesh"
  style={{ background: "var(--cc-bg)" }}
>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(var(--cc-border) 1px, transparent 1px), linear-gradient(90deg, var(--cc-border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orbs */}
        <div
          className="absolute top-24 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "var(--cc-accent)" }}
        />
        <div
          className="absolute top-40 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: "var(--cc-accent-2)" }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 glass">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "var(--cc-green)" }}
            />
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "var(--cc-text-muted)", fontFamily: "var(--font-mono)" }}
            >
              Now in Beta · Free to use
            </span>
          </div>

          <h1
            className="text-5xl sm:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--cc-text)" }}
          >
            Code Together,
            <br />
            <span
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, var(--cc-accent) 0%, var(--cc-accent-2) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Build Together.
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10"
            style={{ color: "var(--cc-text-muted)", lineHeight: 1.8 }}
          >
            A real-time collaborative code editor with live cursors, multi-language support,
            and persistent room storage. Like VS Code Live Share, but in your browser.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl font-bold text-white text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full sm:w-auto"
              style={{
                background: "linear-gradient(135deg, var(--cc-accent), var(--cc-accent-2))",
                boxShadow: "0 0 40px var(--cc-accent-glow)",
                fontFamily: "var(--font-display)",
              }}
            >
              Start Coding Free →
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 w-full sm:w-auto glass"
              style={{ color: "var(--cc-text)" }}
            >
              Sign In
            </Link>
          </div>

          {/* Editor Preview */}
          <div
            className="mt-20 rounded-2xl overflow-hidden glass animate-float"
            style={{
              boxShadow: "0 0 80px rgba(124, 111, 255, 0.15), 0 40px 80px rgba(0,0,0,0.5)",
              border: "1px solid var(--cc-border-hover)",
            }}
          >
            {/* Fake editor header */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ background: "var(--cc-surface-2)", borderBottom: "1px solid var(--cc-border)" }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: "#f87171" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#fbbf24" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#4ade80" }} />
              <span className="ml-4 text-xs" style={{ color: "var(--cc-text-muted)", fontFamily: "var(--font-mono)" }}>
                main.js — react-project
              </span>
              <div className="ml-auto flex gap-2">
                {["Alex", "Sam", "Jordan"].map((name, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{
                      background: ["#7c6fff33", "#ff6b9d33", "#4ade8033"][i],
                      color: ["#7c6fff", "#ff6b9d", "#4ade80"][i],
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
            {/* Fake code */}
            <div className="p-6 text-left" style={{ background: "#0d1117" }}>
              <pre
                className="text-sm leading-relaxed overflow-x-auto"
                style={{ fontFamily: "var(--font-mono)", color: "#e8e8f0" }}
              >
                <code>{`import { useState, useEffect } from 'react'

// 🟣 Alex is editing here
const CollabEditor = ({ roomId }) => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    socket.emit('room:join', { roomId })
    // 🔴 Sam's cursor ↓
    socket.on('room:users', setUsers)
  }, [roomId])

  return <Editor users={users} />
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-4"
            style={{ color: "var(--cc-accent)", fontFamily: "var(--font-mono)" }}
          >
            Everything you need
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold"
            style={{ color: "var(--cc-text)", fontFamily: "var(--font-display)" }}
          >
            Built for real collaboration
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl glass transition-all duration-300 hover:-translate-y-1 group"
              style={{ cursor: "default" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: f.color + "22", color: f.color }}
              >
                {f.icon}
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: "var(--cc-text)", fontFamily: "var(--font-display)" }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--cc-text-muted)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div
          className="max-w-3xl mx-auto text-center p-12 rounded-3xl glass"
          style={{ border: "1px solid var(--cc-border-hover)" }}
        >
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: "var(--cc-text)", fontFamily: "var(--font-display)" }}
          >
            Ready to collaborate?
          </h2>
          <p className="mb-8" style={{ color: "var(--cc-text-muted)" }}>
            Create a room in seconds. Invite your team. Start coding together.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 rounded-xl font-bold text-white text-base transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--cc-accent), var(--cc-accent-2))",
              boxShadow: "0 0 40px var(--cc-accent-glow)",
            }}
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ borderTop: "1px solid var(--cc-border)" }}>
        <p
          className="text-sm"
          style={{ color: "var(--cc-text-dim)", fontFamily: "var(--font-mono)" }}
        >
          CollabCode © {new Date().getFullYear()} · Built with React, Node.js, MongoDB & ❤️
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
