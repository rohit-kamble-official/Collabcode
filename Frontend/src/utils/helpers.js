/**
 * Format time ago (e.g., "5m ago", "2h ago")
 */
export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generate a random room ID from a base string
 */
export const toRoomId = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50) || "my-room";

/**
 * Get user initials (up to 2 chars)
 */
export const getInitials = (name = "") =>
  name.slice(0, 2).toUpperCase() || "??";

/**
 * Cursor colors palette for collaboration
 */
export const CURSOR_COLORS = [
  "#7c6fff", "#ff6b9d", "#4ade80", "#fbbf24",
  "#06b6d4", "#f97316", "#a855f7", "#ec4899",
];

/**
 * Assign a deterministic color from username
 */
export const colorFromUsername = (username = "") => {
  let hash = 0;
  for (const c of username) hash = (hash << 5) - hash + c.charCodeAt(0);
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
};
