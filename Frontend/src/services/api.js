const BASE = "/api";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const roomsAPI = {
  create: (token, data) =>
    fetch(`${BASE}/rooms`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  getMyRooms: (token) =>
    fetch(`${BASE}/rooms/my`, { headers: getHeaders(token) }).then((r) => r.json()),

  getRoom: (token, roomId) =>
    fetch(`${BASE}/rooms/${roomId}`, { headers: getHeaders(token) }).then((r) => r.json()),

  saveCode: (token, roomId, code, language) =>
    fetch(`${BASE}/rooms/${roomId}/save`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify({ code, language }),
    }).then((r) => r.json()),

  deleteRoom: (token, roomId) =>
    fetch(`${BASE}/rooms/${roomId}`, {
      method: "DELETE",
      headers: getHeaders(token),
    }).then((r) => r.json()),
};
