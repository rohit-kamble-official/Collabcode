import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, "Room ID can only contain lowercase letters, numbers, and hyphens"],
    },
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      maxlength: [50, "Room name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    code: {
      type: String,
      default: "// Welcome to CollabCode! Start coding together...\n",
    },
    language: {
      type: String,
      default: "javascript",
      enum: ["javascript", "typescript", "python", "java", "cpp", "c", "go", "rust"],
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Update lastActivity on code save
roomSchema.pre("save", function (next) {
  if (this.isModified("code")) {
    this.lastActivity = new Date();
  }
  next();
});

const Room = mongoose.model("Room", roomSchema);
export default Room;
