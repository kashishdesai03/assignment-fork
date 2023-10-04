// database/connection.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "postgres", // 'mysql' if you're using MySQL
  host: "localhost",
  database: "kashishdesai",
  username: "postgres",
  password: "Flender@1",
  port: "5433",
});

module.exports = sequelize;
