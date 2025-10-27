const { FavoriteEntry } = require("../models");
const { Op } = require("sequelize");
const {
  validateCreateEntry,
  validateUpdateEntry,
  validatePagination,
  validateSearch,
  validateId
} = require("../validators/favoriteValidator");

// Helper function to calculate pagination metadata
const calculatePagination = (page, limit, totalCount) => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalEntries: totalCount,
    hasNextPage,
    hasPrevPage,
    limit
  };
};

// Helper function to format timestamps to IST
const formatTimestamps = (entry) => {
  if (entry && entry.createdAt) {
    const createdAt = new Date(entry.createdAt);
    entry.createdAt = createdAt.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6');
  }
  
  if (entry && entry.updatedAt) {
    const updatedAt = new Date(entry.updatedAt);
    entry.updatedAt = updatedAt.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6');
  }
  
  return entry;
};

// Helper function to format response
const formatResponse = (success, message, data = null, errors = null) => {
  const response = {
    success,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  if (errors !== null) {
    response.errors = errors;
  }

  return response;
};

/**
 * Create a new favorite entry
 * POST /api/entries
 */
exports.createEntry = async (req, res) => {
  try {
    // Check if request body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json(
        formatResponse(false, "Request body is empty. Please provide all required fields.", null, [
          { field: "body", message: "Request body cannot be empty" }
        ])
      );
    }

    // Validate request body
    const validation = await validateCreateEntry(req.body);
    if (!validation.success) {
      return res.status(400).json(
        formatResponse(false, "Validation failed. Please provide all required fields.", null, validation.errors)
      );
    }

    const entryData = validation.data;

    // Check if entry with same title and year already exists
    const existingEntry = await FavoriteEntry.findOne({
      where: {
        title: entryData.title,
        year: entryData.year
      }
    });

    if (existingEntry) {
      return res.status(409).json(
        formatResponse(false, "An entry with this title and year already exists")
      );
    }

    // Create new entry
    const newEntry = await FavoriteEntry.create(entryData);

    // Format timestamps to IST
    const formattedEntry = formatTimestamps(newEntry.toJSON());

    return res.status(201).json(
      formatResponse(true, "Entry created successfully", {
        entry: formattedEntry
      })
    );

  } catch (error) {
    console.error("Create entry error:", error);
    return res.status(500).json(
      formatResponse(false, "Internal server error", null, [
        { message: "Failed to create entry" }
      ])
    );
  }
};

/**
 * Get all entries with pagination
 * GET /api/entries
 */
exports.getAllEntries = async (req, res) => {
  try {
    // Validate query parameters
    const validation = await validatePagination(req.query);
    if (!validation.success) {
      return res.status(400).json(
        formatResponse(false, "Invalid query parameters", null, validation.errors)
      );
    }

    const { page, limit } = validation.data;
    const offset = (page - 1) * limit;

    // Get total count
    const totalCount = await FavoriteEntry.count();

    // Get entries with pagination
    const entries = await FavoriteEntry.findAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: {
        exclude: [] // Include all fields
      }
    });

    // Format timestamps to IST for all entries
    const formattedEntries = entries.map(entry => formatTimestamps(entry.toJSON()));

    const pagination = calculatePagination(page, limit, totalCount);

    return res.status(200).json(
      formatResponse(true, "Entries retrieved successfully", {
        entries: formattedEntries,
        pagination
      })
    );

  } catch (error) {
    console.error("Get all entries error:", error);
    return res.status(500).json(
      formatResponse(false, "Internal server error", null, [
        { message: "Failed to retrieve entries" }
      ])
    );
  }
};

/**
 * Search entries by title
 * GET /api/entries/search
 */
exports.searchEntries = async (req, res) => {
  try {
    // Validate query parameters
    const validation = await validateSearch(req.query);
    if (!validation.success) {
      return res.status(400).json(
        formatResponse(false, "Invalid search parameters", null, validation.errors)
      );
    }

    const { q: searchQuery, page, limit } = validation.data;
    const offset = (page - 1) * limit;

    // Build search conditions
    const searchConditions = {
      title: {
        [Op.like]: `%${searchQuery}%`
      }
    };

    // Get total count for search results
    const totalCount = await FavoriteEntry.count({
      where: searchConditions
    });

    // Get search results with pagination
    const entries = await FavoriteEntry.findAll({
      where: searchConditions,
      limit,
      offset,
      order: [['title', 'ASC']],
      attributes: {
        exclude: [] // Include all fields
      }
    });

    // Format timestamps to IST for all entries
    const formattedEntries = entries.map(entry => formatTimestamps(entry.toJSON()));

    const pagination = calculatePagination(page, limit, totalCount);

    return res.status(200).json(
      formatResponse(true, "Search completed successfully", {
        entries: formattedEntries,
        pagination,
        searchQuery
      })
    );

  } catch (error) {
    console.error("Search entries error:", error);
    return res.status(500).json(
      formatResponse(false, "Internal server error", null, [
        { message: "Failed to search entries" }
      ])
    );
  }
};

/**
 * Get a specific entry by ID
 * GET /api/entries/:id
 */
exports.getEntryById = async (req, res) => {
  try {
    // Validate ID parameter
    const validation = await validateId(req.params);
    if (!validation.success) {
      return res.status(400).json(
        formatResponse(false, "Invalid ID parameter", null, validation.errors)
      );
    }

    const { id } = validation.data;

    // Find entry by ID
    const entry = await FavoriteEntry.findByPk(id);

    if (!entry) {
      return res.status(404).json(
        formatResponse(false, "Entry not found")
      );
    }

    // Format timestamps to IST
    const formattedEntry = formatTimestamps(entry.toJSON());

    return res.status(200).json(
      formatResponse(true, "Entry retrieved successfully", {
        entry: formattedEntry
      })
    );

  } catch (error) {
    console.error("Get entry by ID error:", error);
    return res.status(500).json(
      formatResponse(false, "Internal server error", null, [
        { message: "Failed to retrieve entry" }
      ])
    );
  }
};

/**
 * Update an existing entry
 * PUT /api/entries/:id
 */
exports.updateEntry = async (req, res) => {
  try {
    // Validate ID parameter
    const idValidation = await validateId(req.params);
    if (!idValidation.success) {
      return res.status(400).json(
        formatResponse(false, "Invalid ID parameter", null, idValidation.errors)
      );
    }

    // Validate request body
    const bodyValidation = await validateUpdateEntry(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json(
        formatResponse(false, "Validation failed. Please provide valid field values.", null, bodyValidation.errors)
      );
    }

    const { id } = idValidation.data;
    const updateData = bodyValidation.data;

    // Find entry by ID
    const entry = await FavoriteEntry.findByPk(id);

    if (!entry) {
      return res.status(404).json(
        formatResponse(false, "Entry not found")
      );
    }

    // Check if updating title would create a duplicate
    if (updateData.title) {
      const existingEntry = await FavoriteEntry.findOne({
        where: {
          title: updateData.title,
          id: {
            [Op.ne]: id // Exclude current entry
          }
        }
      });

      if (existingEntry) {
        return res.status(409).json(
          formatResponse(false, "An entry with this title already exists")
        );
      }
    }

    // Update entry
    await entry.update(updateData);

    // Fetch updated entry
    const updatedEntry = await FavoriteEntry.findByPk(id);

    // Format timestamps to IST
    const formattedEntry = formatTimestamps(updatedEntry.toJSON());

    return res.status(200).json(
      formatResponse(true, "Entry updated successfully", {
        entry: formattedEntry
      })
    );

  } catch (error) {
    console.error("Update entry error:", error);
    return res.status(500).json(
      formatResponse(false, "Internal server error", null, [
        { message: "Failed to update entry" }
      ])
    );
  }
};

/**
 * Delete an entry
 * DELETE /api/entries/:id
 */
exports.deleteEntry = async (req, res) => {
  try {
    // Validate ID parameter
    const validation = await validateId(req.params);
    if (!validation.success) {
      return res.status(400).json(
        formatResponse(false, "Invalid ID parameter", null, validation.errors)
      );
    }

    const { id } = validation.data;

    // Find entry by ID
    const entry = await FavoriteEntry.findByPk(id);

    if (!entry) {
      return res.status(404).json(
        formatResponse(false, "Entry not found")
      );
    }

    // Delete entry
    await entry.destroy();

    return res.status(200).json(
      formatResponse(true, "Entry deleted successfully")
    );

  } catch (error) {
    console.error("Delete entry error:", error);
    return res.status(500).json(
      formatResponse(false, "Internal server error", null, [
        { message: "Failed to delete entry" }
      ])
    );
  }
};

/**
 * Get statistics about entries
 * GET /api/entries/stats
 */
exports.getStats = async (req, res) => {
  try {
    // Get total count
    const totalEntries = await FavoriteEntry.count();

    // Get count by type
    const moviesCount = await FavoriteEntry.count({
      where: { type: 'Movie' }
    });

    const tvShowsCount = await FavoriteEntry.count({
      where: { type: 'TV Show' }
    });

    // Get entries by year range
    const currentYear = new Date().getFullYear();
    const recentEntries = await FavoriteEntry.count({
      where: {
        year: {
          [Op.gte]: currentYear - 10
        }
      }
    });

    // Get average budget
    const avgBudgetResult = await FavoriteEntry.findOne({
      attributes: [
        [FavoriteEntry.sequelize.fn('AVG', FavoriteEntry.sequelize.col('budget')), 'avgBudget']
      ],
      raw: true
    });

    const avgBudget = avgBudgetResult ? Math.round(avgBudgetResult.avgBudget) : 0;

    const stats = {
      totalEntries,
      moviesCount,
      tvShowsCount,
      recentEntries,
      avgBudget,
      generatedAt: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6')
    };

    return res.status(200).json(
      formatResponse(true, "Statistics retrieved successfully", {
        stats
      })
    );

  } catch (error) {
    console.error("Get stats error:", error);
    return res.status(500).json(
      formatResponse(false, "Internal server error", null, [
        { message: "Failed to retrieve statistics" }
      ])
    );
  }
};
