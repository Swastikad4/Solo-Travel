const mongoose = require("mongoose");
const { isValidIndianState } = require("../data/indiaLocations");

const AttractionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      default: "Sightseeing",
      trim: true
    },
    description: { type: String, trim: true, default: "" },
    entryFee: { type: String, default: "Free / Nominal" },
    timings: { type: String, default: "Sunrise to Sunset" },
    highlight: { type: String, default: "" }
  },
  { _id: true }
);

const DestinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Destination name is required"],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    // STRICT INDIA VALIDATION: Only "India" is allowed
    country: {
      type: String,
      required: [true, "Country is required"],
      default: "India",
      immutable: true,
      validate: {
        validator: function (v) {
          return v && v.trim().toLowerCase() === "india";
        },
        message: "SoloTravel is an India-only travel platform. Country must be 'India'."
      }
    },
    // 7-TIER HIERARCHY: State / UT
    state: {
      type: String,
      required: [true, "Indian State or Union Territory is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return isValidIndianState(v);
        },
        message: "State or Union Territory must be a recognized Indian State or UT."
      }
    },
    stateType: {
      type: String,
      enum: ["State", "Union Territory"],
      default: "State"
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true
    },
    townOrVillage: {
      type: String,
      trim: true,
      default: ""
    },
    // Attractions within destination
    attractions: [AttractionSchema],

    // Categorization
    category: {
      type: [String],
      default: ["Cultural & Heritage"],
      index: true
    },
    tagline: { type: String, default: "" },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true
    },
    image: {
      type: String,
      required: [true, "Main image URL is required"]
    },
    gallery: {
      type: [String],
      default: []
    },

    // Solo ratings & safety metrics
    safetyRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.2
    },
    soloScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 8.5
    },

    // Budget in INR (₹)
    avgBudget: {
      min: { type: Number, default: 1000 },
      max: { type: Number, default: 2500 },
      perDay: { type: Number, default: 1500 },
      tier: {
        type: String,
        enum: ["Budget", "Mid-range", "Luxury"],
        default: "Budget"
      },
      currency: { type: String, default: "INR (₹)" }
    },

    // Duration & planning
    idealDurationDays: {
      type: Number,
      default: 3,
      min: 1,
      max: 30
    },
    bestTime: {
      type: String,
      default: "October to March"
    },
    bestMonths: {
      type: [String],
      default: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
    },
    language: {
      type: [String],
      default: ["Hindi", "English"]
    },

    // Practical logistics
    howToReach: {
      airport: { type: String, default: "" },
      railway: { type: String, default: "" },
      road: { type: String, default: "" }
    },
    soloTravelerTips: {
      type: [String],
      default: []
    },

    // Backward compatibility with previous schema
    famousPlaces: {
      type: [String],
      default: []
    },
    thingsToDo: {
      type: [String],
      default: []
    },

    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: Ensure slug and country
DestinationSchema.pre("validate", function (next) {
  if (this.country && this.country.trim().toLowerCase() !== "india") {
    return next(new Error("International destinations are forbidden. Country must be 'India'."));
  }
  if (!this.country) {
    this.country = "India";
  }
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }
  // Sync backward compatibility arrays
  if ((!this.famousPlaces || this.famousPlaces.length === 0) && this.attractions && this.attractions.length > 0) {
    this.famousPlaces = this.attractions.map((a) => a.name);
  }
  next();
});

DestinationSchema.index({ slug: 1 }, { unique: true });
DestinationSchema.index({ state: 1 });
DestinationSchema.index({ region: 1 });
DestinationSchema.index({ category: 1 });
DestinationSchema.index({ soloScore: -1 });
DestinationSchema.index({ safetyRating: -1 });

module.exports = mongoose.model("Destination", DestinationSchema);