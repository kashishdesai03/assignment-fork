const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Submission = sequelize.define(
  "Submission",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assignment_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    submission_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    submission_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    submission_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Submission;
