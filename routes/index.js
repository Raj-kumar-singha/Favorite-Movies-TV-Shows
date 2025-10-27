const express = require("express");
const router = express.Router();

// Import controllers
const {
  createEntry,
  getAllEntries,
  searchEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  getStats
} = require("../controllers/favoriteController");

// Import middleware
const { generalLimiter, writeLimiter, searchLimiter } = require("../middleware/rateLimiter");

// Apply general rate limiting to all routes
router.use(generalLimiter);

// Routes

// POST /api/entries - Create a new entry
router.post("/entries", writeLimiter, createEntry);

// GET /api/entries - Get all entries with pagination
router.get("/entries", getAllEntries);

// GET /api/entries/search - Search entries by title
router.get("/entries/search", searchLimiter, searchEntries);

// GET /api/entries/stats - Get statistics
router.get("/entries/stats", getStats);

// GET /api/entries/:id - Get a specific entry by ID
router.get("/entries/:id", getEntryById);

// PUT /api/entries/:id - Update an existing entry
router.put("/entries/:id", writeLimiter, updateEntry);

// DELETE /api/entries/:id - Delete an entry
router.delete("/entries/:id", writeLimiter, deleteEntry);

module.exports = router;
