const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { destinations } = require("../data/sampleData");
const { authenticate } = require("../middleware/auth");

// In-memory favorites/wishlist store for offline/fallback mode
// Keyed by userId => { favorites: [], wishlist: [] }
const inMemoryLists = {};

// Helper: get or init user lists
const getUserLists = (userId) => {
  if (!inMemoryLists[userId]) {
    inMemoryLists[userId] = { favorites: [], wishlist: [] };
  }
  return inMemoryLists[userId];
};

// Helper: resolve destination data from slug
const resolveDestination = (slug) => {
  const normalSlug = (slug || "").toLowerCase().trim();
  const dest = destinations[normalSlug];
  if (dest) return dest;

  // Try to find by slug field or name
  return Object.values(destinations).find(
    (d) =>
      (d.slug || "").toLowerCase() === normalSlug ||
      (d.name || "").toLowerCase() === normalSlug
  );
};

// ==========================================
// FAVORITES
// ==========================================

// GET /api/favorites — Get user's favorites with destination data
router.get("/", authenticate, async (req, res) => {
  const userId = req.user.id;
  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  let favoriteSlugs = [];

  // 1. Try MongoDB
  if (isMongoConnected) {
    try {
      const user = await User.findById(userId).maxTimeMS(2500);
      if (user) {
        favoriteSlugs = user.favorites || [];
      }
    } catch (err) {
      // Fall through
    }
  }

  // 2. In-memory fallback
  if (favoriteSlugs.length === 0) {
    const lists = getUserLists(userId);
    favoriteSlugs = lists.favorites;
  }

  // Resolve full destination data
  const favoriteDestinations = favoriteSlugs
    .map((slug) => resolveDestination(slug))
    .filter(Boolean);

  res.json({
    slugs: favoriteSlugs,
    destinations: favoriteDestinations,
    total: favoriteSlugs.length,
  });
});

// POST /api/favorites/:slug — Add to favorites
router.post("/:slug", authenticate, async (req, res) => {
  const userId = req.user.id;
  const slug = req.params.slug.toLowerCase().trim();

  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Try MongoDB
  if (isMongoConnected) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { favorites: slug } },
        { new: true }
      ).maxTimeMS(2500);

      if (user) {
        // Sync in-memory
        const lists = getUserLists(userId);
        if (!lists.favorites.includes(slug)) {
          lists.favorites.push(slug);
        }
        return res.json({
          message: "Added to favorites!",
          favorites: user.favorites,
        });
      }
    } catch (err) {
      // Fall through
    }
  }

  // 2. In-memory
  const lists = getUserLists(userId);
  if (!lists.favorites.includes(slug)) {
    lists.favorites.push(slug);
  }

  res.json({
    message: "Added to favorites!",
    favorites: lists.favorites,
  });
});

// DELETE /api/favorites/:slug — Remove from favorites
router.delete("/:slug", authenticate, async (req, res) => {
  const userId = req.user.id;
  const slug = req.params.slug.toLowerCase().trim();

  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Try MongoDB
  if (isMongoConnected) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { favorites: slug } },
        { new: true }
      ).maxTimeMS(2500);

      if (user) {
        const lists = getUserLists(userId);
        lists.favorites = lists.favorites.filter((s) => s !== slug);
        return res.json({
          message: "Removed from favorites.",
          favorites: user.favorites,
        });
      }
    } catch (err) {
      // Fall through
    }
  }

  // 2. In-memory
  const lists = getUserLists(userId);
  lists.favorites = lists.favorites.filter((s) => s !== slug);

  res.json({
    message: "Removed from favorites.",
    favorites: lists.favorites,
  });
});

// GET /api/favorites/check/:slug — Check if destination is favorited
router.get("/check/:slug", authenticate, async (req, res) => {
  const userId = req.user.id;
  const slug = req.params.slug.toLowerCase().trim();

  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Try MongoDB
  if (isMongoConnected) {
    try {
      const user = await User.findById(userId).select("favorites wishlist").maxTimeMS(2500);
      if (user) {
        return res.json({
          isFavorited: (user.favorites || []).includes(slug),
          isWishlisted: (user.wishlist || []).includes(slug),
        });
      }
    } catch (err) {
      // Fall through
    }
  }

  // 2. In-memory
  const lists = getUserLists(userId);
  res.json({
    isFavorited: lists.favorites.includes(slug),
    isWishlisted: lists.wishlist.includes(slug),
  });
});

// ==========================================
// WISHLIST
// ==========================================

// GET /api/favorites/wishlist — Get user's wishlist with destination data
router.get("/wishlist", authenticate, async (req, res) => {
  const userId = req.user.id;
  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  let wishlistSlugs = [];

  // 1. Try MongoDB
  if (isMongoConnected) {
    try {
      const user = await User.findById(userId).maxTimeMS(2500);
      if (user) {
        wishlistSlugs = user.wishlist || [];
      }
    } catch (err) {
      // Fall through
    }
  }

  // 2. In-memory fallback
  if (wishlistSlugs.length === 0) {
    const lists = getUserLists(userId);
    wishlistSlugs = lists.wishlist;
  }

  const wishlistDestinations = wishlistSlugs
    .map((slug) => resolveDestination(slug))
    .filter(Boolean);

  res.json({
    slugs: wishlistSlugs,
    destinations: wishlistDestinations,
    total: wishlistSlugs.length,
  });
});

// POST /api/favorites/wishlist/:slug — Add to wishlist
router.post("/wishlist/:slug", authenticate, async (req, res) => {
  const userId = req.user.id;
  const slug = req.params.slug.toLowerCase().trim();

  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Try MongoDB
  if (isMongoConnected) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: slug } },
        { new: true }
      ).maxTimeMS(2500);

      if (user) {
        const lists = getUserLists(userId);
        if (!lists.wishlist.includes(slug)) {
          lists.wishlist.push(slug);
        }
        return res.json({
          message: "Added to wishlist!",
          wishlist: user.wishlist,
        });
      }
    } catch (err) {
      // Fall through
    }
  }

  // 2. In-memory
  const lists = getUserLists(userId);
  if (!lists.wishlist.includes(slug)) {
    lists.wishlist.push(slug);
  }

  res.json({
    message: "Added to wishlist!",
    wishlist: lists.wishlist,
  });
});

// DELETE /api/favorites/wishlist/:slug — Remove from wishlist
router.delete("/wishlist/:slug", authenticate, async (req, res) => {
  const userId = req.user.id;
  const slug = req.params.slug.toLowerCase().trim();

  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Try MongoDB
  if (isMongoConnected) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: slug } },
        { new: true }
      ).maxTimeMS(2500);

      if (user) {
        const lists = getUserLists(userId);
        lists.wishlist = lists.wishlist.filter((s) => s !== slug);
        return res.json({
          message: "Removed from wishlist.",
          wishlist: user.wishlist,
        });
      }
    } catch (err) {
      // Fall through
    }
  }

  // 2. In-memory
  const lists = getUserLists(userId);
  lists.wishlist = lists.wishlist.filter((s) => s !== slug);

  res.json({
    message: "Removed from wishlist.",
    wishlist: lists.wishlist,
  });
});

module.exports = router;
