import express from "express";
import {
  createRoom,
  getMyRooms,
  getRoom,
  saveRoomCode,
  deleteRoom,
} from "../controllers/roomController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // All room routes require authentication

router.post("/", createRoom);
router.get("/my", getMyRooms);
router.get("/:roomId", getRoom);
router.patch("/:roomId/save", saveRoomCode);
router.delete("/:roomId", deleteRoom);

export default router;
