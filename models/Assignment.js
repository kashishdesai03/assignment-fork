// Assignment.js (inside models folder)
const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Assignment = sequelize.define(
  "Assignment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Use UUIDV4 to generate a random UUID
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 100,
      },
    },
    num_of_attemps: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 1,
        max: 100,
      },
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    assignment_created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    assignment_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false, // Disable createdAt and updatedAt fields
  }
);
// Other fields as per your assignment requirements

module.exports = Assignment;
