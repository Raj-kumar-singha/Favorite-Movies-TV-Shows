const yup = require("yup");

// Base schema for favorite entry validation
const baseFavoriteEntrySchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(1, "Title cannot be empty")
    .max(255, "Title cannot exceed 255 characters")
    .trim(),

  type: yup
    .string()
    .required("Type is required")
    .oneOf(["Movie", "TV Show"], "Type must be either 'Movie' or 'TV Show'"),

  director: yup
    .string()
    .required("Director is required")
    .min(1, "Director name cannot be empty")
    .max(255, "Director name cannot exceed 255 characters")
    .trim(),

  budget: yup
    .number()
    .required("Budget is required")
    .integer("Budget must be a whole number")
    .min(0, "Budget cannot be negative")
    .max(999999999999, "Budget value is too large"),

  location: yup
    .string()
    .required("Location is required")
    .min(1, "Location cannot be empty")
    .max(255, "Location cannot exceed 255 characters")
    .trim(),

  duration: yup
    .string()
    .required("Duration is required")
    .min(1, "Duration cannot be empty")
    .max(100, "Duration cannot exceed 100 characters")
    .trim(),

  year: yup
    .number()
    .required("Year is required")
    .integer("Year must be a whole number")
    .min(1800, "Year must be after 1800")
    .max(
      new Date().getFullYear() + 10,
      "Year cannot be more than 10 years in the future"
    ),
});

// Schema for creating a new entry (all fields required)
const createFavoriteEntrySchema = baseFavoriteEntrySchema;

// Schema for updating an entry (all fields optional)
const updateFavoriteEntrySchema = yup
  .object({
    title: yup
      .string()
      .min(1, "Title cannot be empty")
      .max(255, "Title cannot exceed 255 characters")
      .trim(),

    type: yup
      .string()
      .oneOf(["Movie", "TV Show"], "Type must be either 'Movie' or 'TV Show'"),

    director: yup
      .string()
      .min(1, "Director name cannot be empty")
      .max(255, "Director name cannot exceed 255 characters")
      .trim(),

    budget: yup
      .number()
      .integer("Budget must be a whole number")
      .min(0, "Budget cannot be negative")
      .max(999999999999, "Budget value is too large"),

    location: yup
      .string()
      .min(1, "Location cannot be empty")
      .max(255, "Location cannot exceed 255 characters")
      .trim(),

    duration: yup
      .string()
      .min(1, "Duration cannot be empty")
      .max(100, "Duration cannot exceed 100 characters")
      .trim(),

    year: yup
      .number()
      .integer("Year must be a whole number")
      .min(1800, "Year must be after 1800")
      .max(
        new Date().getFullYear() + 10,
        "Year cannot be more than 10 years in the future"
      ),
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided for update",
    function (value) {
      // Check if the current value object has any non-empty fields
      if (!value || typeof value !== "object") {
        return false;
      }

      const hasAtLeastOneField = Object.keys(value).some((key) => {
        const fieldValue = value[key];
        return (
          fieldValue !== undefined && fieldValue !== null && fieldValue !== ""
        );
      });

      return hasAtLeastOneField;
    }
  );

// Schema for pagination query parameters
const paginationSchema = yup.object({
  page: yup
    .number()
    .integer("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .default(1),

  limit: yup
    .number()
    .integer("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

// Schema for search query parameters
const searchSchema = yup.object({
  q: yup
    .string()
    .required("Search query is required")
    .min(1, "Search query cannot be empty")
    .max(255, "Search query cannot exceed 255 characters")
    .trim(),

  page: yup
    .number()
    .integer("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .default(1),

  limit: yup
    .number()
    .integer("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

// Schema for ID parameter validation
const idSchema = yup.object({
  id: yup
    .number()
    .required("ID is required")
    .integer("ID must be a whole number")
    .positive("ID must be a positive number"),
});

// Validation functions
const validateCreateEntry = async (data) => {
  try {
    const validatedData = await createFavoriteEntrySchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return { success: true, data: validatedData };
  } catch (error) {
    const errors =
      error.inner && error.inner.length > 0
        ? error.inner.map((err) => ({
            field: err.path,
            message: err.message,
          }))
        : [
            {
              field: "validation",
              message: error.message || "Validation failed",
            },
          ];
    return { success: false, errors };
  }
};

const validateUpdateEntry = async (data) => {
  try {
    // Check if data is valid object
    if (!data || typeof data !== "object") {
      return {
        success: false,
        errors: [
          {
            field: "body",
            message: "Request body must be a valid object",
          },
        ],
      };
    }

    const validatedData = await updateFavoriteEntrySchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return { success: true, data: validatedData };
  } catch (error) {
    const errors =
      error.inner && error.inner.length > 0
        ? error.inner.map((err) => ({
            field: err.path,
            message: err.message,
          }))
        : [
            {
              field: "validation",
              message: error.message || "Validation failed",
            },
          ];
    return { success: false, errors };
  }
};

const validatePagination = async (query) => {
  try {
    const validatedQuery = await paginationSchema.validate(query, {
      abortEarly: false,
      stripUnknown: true,
    });
    return { success: true, data: validatedQuery };
  } catch (error) {
    const errors =
      error.inner && error.inner.length > 0
        ? error.inner.map((err) => ({
            field: err.path,
            message: err.message,
          }))
        : [
            {
              field: "validation",
              message: error.message || "Validation failed",
            },
          ];
    return { success: false, errors };
  }
};

const validateSearch = async (query) => {
  try {
    const validatedQuery = await searchSchema.validate(query, {
      abortEarly: false,
      stripUnknown: true,
    });
    return { success: true, data: validatedQuery };
  } catch (error) {
    const errors =
      error.inner && error.inner.length > 0
        ? error.inner.map((err) => ({
            field: err.path,
            message: err.message,
          }))
        : [
            {
              field: "validation",
              message: error.message || "Validation failed",
            },
          ];
    return { success: false, errors };
  }
};

const validateId = async (params) => {
  try {
    const validatedParams = await idSchema.validate(params, {
      abortEarly: false,
      stripUnknown: true,
    });
    return { success: true, data: validatedParams };
  } catch (error) {
    const errors =
      error.inner && error.inner.length > 0
        ? error.inner.map((err) => ({
            field: err.path,
            message: err.message,
          }))
        : [
            {
              field: "validation",
              message: error.message || "Validation failed",
            },
          ];
    return { success: false, errors };
  }
};

module.exports = {
  validateCreateEntry,
  validateUpdateEntry,
  validatePagination,
  validateSearch,
  validateId,
  createFavoriteEntrySchema,
  updateFavoriteEntrySchema,
  paginationSchema,
  searchSchema,
  idSchema,
};
