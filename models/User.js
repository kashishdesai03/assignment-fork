// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection"); // Import your Sequelize instance
const bcrypt = require("bcrypt");
// const { v4: uuidv4 } = require("uuid");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Generate a UUID using v4 by default
    primaryKey: true,
    // allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Define other fields as per your CSV structure
});

// Before saving the user, hash the password
User.beforeCreate(async (user) => {
  const saltRounds = 12; // Number of salt rounds (cost factor)
  const hashedPassword = bcrypt.hashSync(user.password, saltRounds);
  user.password = hashedPassword;
});

module.exports = User;
