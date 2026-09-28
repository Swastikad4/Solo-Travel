const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const { authenticate } = require("../middleware/auth");

// In-memory reviews store for offline/fallback mode
const inMemoryReviews = [];

// Helper: compute average rating and distribution for a destination
const computeStats = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  reviews.forEach((r) => {
    const rating = Math.round(r.rating);
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
    sum += r.rating;
  });

  return {
    averageRating: Math.round((sum / reviews.length) * 10) / 10,
    totalReviews: reviews.length,
    distribution,
  };
};

// ==========================================
// 1. GET ALL REVIEWS FOR A DESTINATION
// ==========================================
router.get("/:destinationSlug", async (req, res) => {
  const slug = req.params.destinationSlug.toLowerCase().trim();

  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Try MongoDB
  if (isMongoConnected) {
    try {
      const dbReviews = await Review.find({ destinationSlug: slug })
        .sort({ createdAt: -1 })
        .maxTimeMS(2500);

      if (dbReviews) {
        const stats = computeStats(dbReviews);
        return res.json({
          reviews: dbReviews,
          ...stats,
        });
      }
    } catch (err) {
      // Fall through
    }
  }

  // 2. In-memory
  const memReviews = inMemoryReviews
    .filter((r) => r.destinationSlug === slug)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const stats = computeStats(memReviews);
  res.json({
    reviews: memReviews,
    ...stats,
  });
});

// ==========================================
// 2. ADD A REVIEW
// ==========================================
router.post("/:destinationSlug", authenticate, async (req, res) => {
  const slug = req.params.destinationSlug.toLowerCase().trim();
  const { rating, title, content, visitDate, travelStyle } = req.body;

  // Validation
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  if (!content || typeof content !== "string" || content.trim().length < 10) {
    return res
      .status(400)
      .json({ error: "Review content must be at least 10 characters long." });
  }

  const reviewData = {
    destinationSlug: slug,
    userId: req.user.id,
    userName: req.user.name || "Solo Traveler",
    userAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    rating: Number(rating),
    title: title ? title.trim().slice(0, 120) : "",
    content: content.trim().slice(0, 2000),
    visitDate: visitDate || "",
    travelStyle: travelStyle || "Solo",
  };

  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Try MongoDB
  if (isMongoConnected) {
    try {
      const newReview = new Review(reviewData);
      await newReview.save();
      return res.status(201).json(newReview);
    } catch (err) {
      // Fall through
    }
  }

  // 2. In-memory
  const now = new Date().toISOString();
  const memReview = {
    _id: "rev_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    ...reviewData,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryReviews.push(memReview);
  res.status(201).json(memReview);
});

// ==========================================
// 3. EDIT OWN REVIEW
// ==========================================
router.put("/:reviewId", authenticate, async (req, res) => {
  const reviewId = req.params.reviewId;
  const userId = req.user.id;
  const { rating, title, content, visitDate, travelStyle } = req.body;

  const updates = {};
  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Rating must be between 1 and 5." });
    }
    updates.rating = Number(rating);
  }
  if (title !== undefined) updates.title = title.trim().slice(0, 120);
  if (content !== undefined) {
    if (content.trim().length < 10) {
      return res
        .status(400)
        .json({ error: "Review content must be at least 10 characters." });
    }
    updates.content = content.trim().slice(0, 2000);
  }
  if (visitDate !== undefined) updates.visitDate = visitDate;
  if (travelStyle !== undefined) updates.travelStyle = travelStyle;
  updates.updatedAt = new Date().toISOString();

  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Try MongoDB
  if (isMongoConnected) {
    try {
      const review = await Review.findById(reviewId).maxTimeMS(2500);
      if (review) {
        if (String(review.userId) !== String(userId)) {
          return res
            .status(403)
            .json({ error: "You can only edit your own reviews." });
        }
        Object.assign(review, updates);
        await review.save();
        return res.json(review);
      }
    } catch (err) {
      // Fall through
    }
  }

  // 2. In-memory
  const memIdx = inMemoryReviews.findIndex((r) => r._id === reviewId);
  if (memIdx === -1) {
    return res.status(404).json({ error: "Review not found." });
  }

  if (String(inMemoryReviews[memIdx].userId) !== String(userId)) {
    return res
      .status(403)
      .json({ error: "You can only edit your own reviews." });
  }

  inMemoryReviews[memIdx] = { ...inMemoryReviews[memIdx], ...updates };
  res.json(inMemoryReviews[memIdx]);
});

// ==========================================
// 4. DELETE OWN REVIEW
// ==========================================
router.delete("/:reviewId", authenticate, async (req, res) => {
  const reviewId = req.params.reviewId;
  const userId = req.user.id;

  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Try MongoDB
  if (isMongoConnected) {
    try {
      const review = await Review.findById(reviewId).maxTimeMS(2500);
      if (review) {
        if (String(review.userId) !== String(userId)) {
          return res
            .status(403)
            .json({ error: "You can only delete your own reviews." });
        }
        await Review.findByIdAndDelete(reviewId);
        return res.json({ message: "Review deleted successfully." });
      }
    } catch (err) {
      // Fall through
    }
  }

  // 2. In-memory
  const memIdx = inMemoryReviews.findIndex((r) => r._id === reviewId);
  if (memIdx === -1) {
    return res.status(404).json({ error: "Review not found." });
  }

  if (String(inMemoryReviews[memIdx].userId) !== String(userId)) {
    return res
      .status(403)
      .json({ error: "You can only delete your own reviews." });
  }

  inMemoryReviews.splice(memIdx, 1);
  res.json({ message: "Review deleted successfully." });
});

module.exports = router;
