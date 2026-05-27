import jwt from "jsonwebtoken";
import Room from "../models/Room.js";

/**
 * Initialize Socket.IO with room-based collaboration
 */
const initializeSockets = (io) => {

  // Track active users per room
  const roomUsers = new Map();

  // Authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      socket.user = {
        username: "Guest",
        color: "#94a3b8",
        id: null,
      };
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      socket.user = {
        username: "Guest",
        color: "#94a3b8",
        id: null,
      };
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /**
     * Join Room
     */
    socket.on("room:join", async ({ roomId, user }) => {
      try {
        socket.join(roomId);

        socket.currentRoom = roomId;
        socket.userInfo = user;

        // Create room map if not exists
        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Map());
        }

        // Add user
        roomUsers.get(roomId).set(socket.id, {
          ...user,
          socketId: socket.id,
        });

        // Fetch saved room code
        const room = await Room.findOne({ roomId });

        if (room) {
          socket.emit("room:code", {
            code: room.code,
            language: room.language,
          });
        }

        // Send users list
        const users = Array.from(
          roomUsers.get(roomId)?.values() || []
        );

        io.to(roomId).emit("room:users", users);

        console.log(`👤 ${user.username} joined room: ${roomId}`);
      } catch (err) {
        console.error("room:join error:", err);
      }
    });

    /**
     * Leave Room
     */
    socket.on("room:leave", ({ roomId }) => {
      handleLeave(socket, roomId);
    });

    /**
     * Code Change Sync
     */
    socket.on("room:code-change", ({ roomId, code }) => {
      socket.to(roomId).emit("room:code-change", { code });
    });

    /**
     * Auto Save
     */
    socket.on("room:save", async ({ roomId, code, language }) => {
      try {
        await Room.findOneAndUpdate(
          { roomId },
          {
            code,
            language,
            lastActivity: new Date(),
          },
          { upsert: true }
        );
      } catch (err) {
        console.error("Auto-save error:", err);
      }
    });

    /**
     * Language Change
     */
    socket.on("room:language", ({ roomId, language }) => {
      socket.to(roomId).emit("room:language", { language });
    });

    /**
     * Typing Indicator
     */
    socket.on("room:typing", ({ roomId, username }) => {
      socket.to(roomId).emit("room:typing", { username });
    });

    /**
     * Chat Messages
     */
    socket.on("room:chat", ({ roomId, message, user }) => {
      io.to(roomId).emit("room:chat", {
        message,
        user,
        timestamp: new Date().toISOString(),
      });
    });

    /**
     * Disconnect
     */
    socket.on("disconnect", () => {
      if (socket.currentRoom) {
        handleLeave(socket, socket.currentRoom);
      }

      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  /**
   * Handle Leave
   */
  const handleLeave = (socket, roomId) => {
    socket.leave(roomId);

    const users = roomUsers.get(roomId);

    if (users) {
      users.delete(socket.id);

      if (users.size === 0) {
        roomUsers.delete(roomId);
      } else {
        io.to(roomId).emit(
          "room:users",
          Array.from(users.values())
        );
      }
    }

    if (socket.userInfo) {
      console.log(
        `👤 ${socket.userInfo.username} left room: ${roomId}`
      );
    }
  };
};

export default initializeSockets;