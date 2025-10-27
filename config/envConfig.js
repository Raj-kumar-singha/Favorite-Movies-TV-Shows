require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  dbName: process.env.DB_NAME,
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  jwtSecret: process.env.JWT_SECRET
};
