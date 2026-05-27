/**
 * Validate email format
 */
export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

/**
 * Validate password strength (min 6 chars)
 */
export const isStrongPassword = (password) => password && password.length >= 6;

/**
 * Validate room ID format (lowercase, alphanumeric, hyphens)
 */
export const isValidRoomId = (id) => /^[a-z0-9-]{2,50}$/.test(id);

/**
 * Sanitize a string to a valid room ID
 */
export const toRoomId = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50);

/**
 * Generate a random hex color for user cursors
 */
export const randomColor = () => {
  const colors = [
    "#7c6fff", "#ff6b9d", "#4ade80", "#fbbf24",
    "#06b6d4", "#f97316", "#a855f7", "#ec4899",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
