import { WebSocketServer } from "ws";
import http from "http";

const server = http.createServer();

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("✅ Client connected");

  ws.on("message", (message) => {
    // Broadcast message to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});

server.listen(1234, () => {
  console.log("🚀 WebSocket server running on ws://localhost:1234");
});