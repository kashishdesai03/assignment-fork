// db/connection.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize({
  port: process.env.DBPORT,
  database: process.env.DBNAME,
  username: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  host: process.env.PORT,
  dialect: "postgres",
});

module.exports = sequelize;
