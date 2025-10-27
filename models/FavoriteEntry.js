const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FavoriteEntry = sequelize.define(
    "FavoriteEntry",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Title cannot be empty"
          },
          len: {
            args: [1, 255],
            msg: "Title must be between 1 and 255 characters"
          }
        }
      },
      type: {
        type: DataTypes.ENUM("Movie", "TV Show"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["Movie", "TV Show"]],
            msg: "Type must be either 'Movie' or 'TV Show'"
          }
        }
      },
      director: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Director cannot be empty"
          },
          len: {
            args: [1, 255],
            msg: "Director name must be between 1 and 255 characters"
          }
        }
      },
      budget: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Budget must be a valid integer"
          },
          min: {
            args: [0],
            msg: "Budget cannot be negative"
          },
          max: {
            args: [999999999999],
            msg: "Budget value is too large"
          }
        }
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Location cannot be empty"
          },
          len: {
            args: [1, 255],
            msg: "Location must be between 1 and 255 characters"
          }
        }
      },
      duration: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Duration cannot be empty"
          },
          len: {
            args: [1, 100],
            msg: "Duration must be between 1 and 100 characters"
          }
        }
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Year must be a valid integer"
          },
          min: {
            args: [1800],
            msg: "Year must be after 1800"
          },
          max: {
            args: [new Date().getFullYear() + 10],
            msg: "Year cannot be more than 10 years in the future"
          }
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: "favorite_entries",
      freezeTableName: true,
      timestamps: true,
      indexes: [
        {
          name: 'idx_title',
          fields: ['title']
        },
        {
          name: 'idx_type',
          fields: ['type']
        },
        {
          name: 'idx_director',
          fields: ['director']
        },
        {
          name: 'idx_year',
          fields: ['year']
        },
        {
          name: 'idx_title_search',
          fields: ['title'],
          using: 'BTREE'
        }
      ],
      hooks: {
        beforeUpdate: (instance) => {
          instance.updatedAt = new Date();
        }
      }
    }
  );

  return FavoriteEntry;
};
