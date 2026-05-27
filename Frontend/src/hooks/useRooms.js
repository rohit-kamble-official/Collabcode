import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { roomsAPI } from "../services/api";
import toast from "react-hot-toast";

/**
 * Custom hook for managing rooms data
 */
export const useRooms = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roomsAPI.getMyRooms(token);
      if (data.success) {
        setRooms(data.rooms);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const createRoom = async (formData) => {
    const data = await roomsAPI.create(token, formData);
    if (data.success) {
      setRooms((prev) => [data.room, ...prev]);
    }
    return data;
  };

  const deleteRoom = async (roomId) => {
    const data = await roomsAPI.deleteRoom(token, roomId);
    if (data.success) {
      setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
      toast.success("Room deleted");
    } else {
      toast.error(data.message);
    }
    return data;
  };

  return { rooms, loading, error, fetchRooms, createRoom, deleteRoom };
};
