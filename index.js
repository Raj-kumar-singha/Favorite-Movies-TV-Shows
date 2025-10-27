const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Import configurations
const { port, nodeEnv } = require("./config/envConfig");
const { connectDatabase } = require("./config/database");

// Import services
const { autoSeedDatabase } = require("./services/seedService");

// Import routes
const apiRoutes = require("./routes");

// Import middleware
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Logging middleware
if (nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JSON parsing error handler
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
      errors: [
        {
          field: "body",
          message: "Request body contains invalid JSON syntax"
        }
      ]
    });
  }
  next(error);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6'),
    environment: nodeEnv,
    version: "1.0.0"
  });
});

// API routes
app.use("/api", apiRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Favorite Movies & TV Shows API",
    version: "1.0.0",
    health: "/health",
    endpoints: {
      "POST /api/entries": "Create a new entry",
      "GET /api/entries": "Get all entries with pagination",
      "GET /api/entries/search": "Search entries by title",
      "GET /api/entries/stats": "Get statistics",
      "GET /api/entries/:id": "Get entry by ID",
      "PUT /api/entries/:id": "Update entry by ID",
      "DELETE /api/entries/:id": "Delete entry by ID"
    }
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Global server variable for graceful shutdown
let server = null;

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');

      // Close database connections
      try {
        const { sequelize } = require("./config/database");
        await sequelize.close();
        console.log('Database connections closed');
      } catch (error) {
        console.error('Error closing database connections:', error);
      }

      console.log('Graceful shutdown completed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle different termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start server
const startServer = async () => {
  try {
    console.log("Starting Favorite Movies & TV Shows API...");
    
    // Connect to database first
    await connectDatabase();
    
    // Auto-seed database with sample data
    await autoSeedDatabase();
    
    // Start HTTP server
    server = app.listen(port || 3000, () => {
      console.log("\nServer is running!");
      console.log(`   URL: http://localhost:${port || 3000}`);
      console.log(`   Health: http://localhost:${port || 3000}/health`);
      console.log(`   API: http://localhost:${port || 3000}/api/entries`);
      console.log("\nReady to manage your favorite movies and TV shows!");
    });

    return server;
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start the application
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };