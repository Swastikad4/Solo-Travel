const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ["USER", "MESSAGE", "GROUP", "REVIEW", "OTHER"],
      required: true,
      default: "USER"
    },
    targetId: {
      type: String,
      required: true
    },
    targetName: {
      type: String,
      default: ""
    },
    reportedBy: {
      type: String,
      required: true
    },
    reporterName: {
      type: String,
      default: "Solo Traveler"
    },
    reportedUser: {
      type: String,
      default: ""
    },
    reason: {
      type: String,
      required: [true, "Report reason is required"],
      trim: true,
      maxlength: [1000, "Reason cannot exceed 1000 characters"]
    },
    status: {
      type: String,
      enum: ["pending", "investigating", "resolved", "dismissed"],
      default: "pending"
    },
    actionTaken: {
      type: String,
      enum: ["none", "warning", "banned", "content_deleted", "dismissed"],
      default: "none"
    },
    adminNotes: {
      type: String,
      default: ""
    },
    resolvedBy: {
      type: String,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

ReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Report", ReportSchema);
