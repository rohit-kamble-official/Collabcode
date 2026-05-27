// ── Avatar ──────────────────────────────────────────────────────────────────
export const Avatar = ({ username = "?", color = "#7c6fff", size = 32, className = "" }) => {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold select-none flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: color + "33",
        border: `2px solid ${color}`,
        color,
        fontSize: size * 0.35,
        fontFamily: "var(--font-mono)",
      }}
    >
      {initials}
    </div>
  );
};

// ── Online Dot ───────────────────────────────────────────────────────────────
export const OnlineDot = ({ online = true }) => (
  <span
    className="inline-block rounded-full flex-shrink-0"
    style={{
      width: 8,
      height: 8,
      background: online ? "var(--cc-green)" : "var(--cc-text-dim)",
      boxShadow: online ? "0 0 6px var(--cc-green)" : "none",
    }}
  />
);

// ── Language Badge ───────────────────────────────────────────────────────────
const langColors = {
  javascript: "#f7df1e",
  typescript: "#3178c6",
  python: "#3776ab",
  java: "#ed8b00",
  cpp: "#00599c",
  c: "#a8b9cc",
  go: "#00add8",
  rust: "#ce4a00",
};

export const LangBadge = ({ lang }) => (
  <span
    className="px-2 py-0.5 rounded text-xs font-bold uppercase"
    style={{
      background: (langColors[lang] || "#7c6fff") + "22",
      color: langColors[lang] || "#7c6fff",
      border: `1px solid ${(langColors[lang] || "#7c6fff")}44`,
      fontFamily: "var(--font-mono)",
    }}
  >
    {lang}
  </span>
);

// ── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20 }) => (
  <div
    className="rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
    style={{
      width: size,
      height: size,
      borderColor: "var(--cc-accent)",
      borderTopColor: "transparent",
    }}
  />
);
