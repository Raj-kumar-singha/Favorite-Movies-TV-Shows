const { sequelize } = require("../config/database");
const FavoriteEntry = require("./FavoriteEntry")(sequelize);

// Initialize models
const models = {
  FavoriteEntry
};

// Export models and sequelize instance
module.exports = {
  ...models,
  sequelize
};
