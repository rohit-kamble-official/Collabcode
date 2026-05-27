import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import initializeSockets from "./sockets/index.js";
import { errorHandler } from "./utils/errorHandler.js";

// ─── App Setup ───────────────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);
app.use(express.static("public"));

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Required for Monaco Editor
}));

app.use(mongoSanitize()); // Prevent NoSQL injection

// CORS - only allow frontend URL
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files (built frontend in production)
app.use(express.static("public"));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "CollabCode API is running",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Catch-all for SPA (serve index.html for non-API routes in production)
app.get("*", (_req, res) => {
  res.sendFile("public/index.html", { root: "." }, (err) => {
    if (err) res.status(404).json({ message: "Not found" });
  });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initializeSockets(io);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 CollabCode Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}\n`);
  });
};

start();
