const { Sequelize } = require("sequelize");
const {
  dbName,
  dbUsername,
  dbPassword,
  dbHost,
  dbPort,
} = require("./envConfig");

// Database configuration
const config = {
  DB_Name: dbName,
  DB_Username: dbUsername,
  DB_Password: dbPassword,
  options: {
    host: dbHost,
    port: dbPort,
    dialect: "mysql",
    timezone: "+05:30", // Indian Standard Time (IST)
    logging: false,
    pool: {
      max: 5,
      min: 1,
      acquire: 60000,
      idle: 10000,
      evict: 1000,
    },
    dialectOptions: {
      dateStrings: true,
      typeCast: function (field, next) {
        if (field.type === "DATETIME") {
          return field.string();
        }
        return next();
      },
      timezone: "+05:30",
    },
  },
};

// Create Sequelize instance
const sequelize = new Sequelize(
  config.DB_Name,
  config.DB_Username,
  config.DB_Password,
  config.options
);

// Test database connection
const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log("Database synchronized");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    // Retry connection after 5 seconds
    setTimeout(() => {
      console.log("Retrying database connection...");
      connectDatabase();
    }, 5000);
  }
};

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("Closing database connections...");
  await sequelize.close();
  process.exit(0);
});

module.exports = {
  sequelize,
  connectDatabase,
};
