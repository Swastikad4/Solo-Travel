const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  time: { type: String, default: "09:00", trim: true },
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ["Transportation", "Accommodation", "Food", "Activities", "Miscellaneous"],
    default: "Activities"
  },
  cost: { type: Number, default: 0, min: 0 },
  location: { type: String, trim: true, default: "" },
  notes: { type: String, trim: true, default: "" }
});

const DayPlanSchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  date: { type: String, default: "" },
  title: { type: String, trim: true, default: "" },
  activities: [ActivitySchema]
});

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ["Transportation", "Accommodation", "Food", "Activities", "Miscellaneous"],
    default: "Miscellaneous"
  },
  cost: { type: Number, required: true, min: 0 },
  date: { type: String, default: "" },
  notes: { type: String, trim: true, default: "" }
});

const TripSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true },
    title: { type: String, trim: true, default: "" },
    destination: { type: String, required: true, trim: true },
    state: { type: String, trim: true, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    travelers: { type: Number, default: 1, min: 1 },
    budget: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["Planning", "Confirmed", "Completed", "Cancelled"],
      default: "Planning"
    },
    coverImage: { type: String, default: "" },
    notes: { type: String, trim: true, default: "" },
    isPublic: { type: Boolean, default: false },
    shareId: { type: String, unique: true, sparse: true },
    sharedAt: { type: Date },
    itinerary: [DayPlanSchema],
    expenses: [ExpenseSchema]
  },
  {
    timestamps: true
  }
);

TripSchema.index({ userId: 1, createdAt: -1 });
TripSchema.index({ destination: 1 });
TripSchema.index({ isPublic: 1 });
TripSchema.index({ status: 1 });

module.exports = mongoose.model("Trip", TripSchema);