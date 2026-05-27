import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

/**
 * Custom hook for Socket.IO connection management
 * Handles connect/disconnect lifecycle cleanly
 */
export const useSocket = (token) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io("/", {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return { socket: socketRef, connected };
};
