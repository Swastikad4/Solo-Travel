const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    avatar: {
      type: String,
      default:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    travelInterests: {
      type: [String],
      default: ["Heritage & Culture", "Photography", "Street Food"],
    },
    preferredDestinations: {
      type: [String],
      default: ["Rajasthan", "Himachal Pradesh", "Kerala"],
    },
    travelStyle: {
      type: String,
      enum: [
        "Budget Backpacker",
        "Slow Nomad",
        "Adventure Seeker",
        "Cultural Explorer",
        "Luxury Solivagant",
        "Weekend Wanderer",
      ],
      default: "Cultural Explorer",
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      sparse: true,
    },
    favorites: {
      type: [String],
      default: [],
    },
    wishlist: {
      type: [String],
      default: [],
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reports: [
      {
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    privacySettings: {
      whoCanMessageMe: {
        type: String,
        enum: ["everyone", "group_members", "nobody"],
        default: "everyone",
      },
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Hash password before saving if modified
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization (strip password)
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", UserSchema);