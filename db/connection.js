// db/connection.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize({
  database: process.env.DBNAME,
  username: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  host: process.env.PORT,
  port: process.env.DBPORT,
  dialect: "postgres",
});

module.exports = sequelize;
