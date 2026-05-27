import Room from "../models/Room.js";
import User from "../models/User.js";

/**
 * POST /api/rooms
 * Create a new room
 */
export const createRoom = async (req, res) => {
  try {
    const { name, description, language, isPrivate, roomId } = req.body;

    if (!name || !roomId) {
      return res.status(400).json({
        success: false,
        message: "Room name and room ID are required.",
      });
    }

    // Validate roomId format
    const roomIdRegex = /^[a-z0-9-]+$/;
    if (!roomIdRegex.test(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Room ID can only contain lowercase letters, numbers, and hyphens.",
      });
    }

    // Check if roomId already exists
    const existing = await Room.findOne({ roomId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A room with this ID already exists. Try another ID.",
      });
    }

    const room = await Room.create({
      roomId,
      name,
      description: description || "",
      language: language || "javascript",
      isPrivate: isPrivate || false,
      owner: req.user._id,
      collaborators: [req.user._id],
    });

    // Add room to user's rooms list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { rooms: room._id },
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully!",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/rooms/my
 * Get all rooms for the current user
 */
export const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id },
      ],
    })
      .populate("owner", "username color")
      .sort({ lastActivity: -1 })
      .limit(20);

    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/rooms/:roomId
 * Get room by roomId string
 */
export const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).populate(
      "owner",
      "username color"
    );

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PATCH /api/rooms/:roomId/save
 * Save code to room (auto-save)
 */
export const saveRoomCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      { code, language, lastActivity: new Date() },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    res.json({ success: true, message: "Code saved." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * DELETE /api/rooms/:roomId
 * Delete a room (owner only)
 */
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    if (room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the room owner can delete it." });
    }

    await room.deleteOne();
    await User.updateMany({ rooms: room._id }, { $pull: { rooms: room._id } });

    res.json({ success: true, message: "Room deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};
