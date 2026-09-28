const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    destinationSlug: {
      type: String,
      required: [true, "Destination slug is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    userAvatar: {
      type: String,
      default:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
      default: "",
    },
    content: {
      type: String,
      required: [true, "Review content is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters long"],
      maxlength: [2000, "Review cannot exceed 2000 characters"],
    },
    visitDate: {
      type: String,
      default: "",
    },
    travelStyle: {
      type: String,
      enum: ["Solo", "Couple", "Family", "Friends", "Business", ""],
      default: "Solo",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookup
ReviewSchema.index({ destinationSlug: 1, userId: 1 });

module.exports = mongoose.model("Review", ReviewSchema);
