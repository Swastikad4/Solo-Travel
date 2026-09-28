const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      minlength: [3, "Group name must be at least 3 characters"],
      maxlength: [80, "Group name cannot exceed 80 characters"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Group description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Backpacking",
        "Trekking",
        "Beach & Chill",
        "Heritage & Culture",
        "Wildlife & Nature",
        "Road Trips",
        "General",
      ],
      default: "General",
    },
    coverImage: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    rules: {
      type: [String],
      default: [
        "Be respectful to all solo travelers.",
        "No spam or unsolicited promotional links.",
        "Share authentic travel tips, homestays, and route updates.",
        "Prioritize safety and local cultural etiquette.",
      ],
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

GroupSchema.index({ destination: 1, category: 1 });
GroupSchema.index({ members: 1 });
GroupSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("Group", GroupSchema);
