const express = require("express");
const router = express.Router();
const { getDestinationSafetyInfo } = require("../services/safetyService");

/**
 * 1. Get Safety Information, Emergency Contacts & Guidelines for destination
 * GET /api/safety/:destination
 */
router.get("/:destination", (req, res) => {
  try {
    const destination = req.params.destination;
    const safetyData = getDestinationSafetyInfo(destination);
    res.json(safetyData);
  } catch (error) {
    console.error("Safety Route Error:", error);
    res.status(500).json({ error: "Failed to fetch safety information." });
  }
});

module.exports = router;
