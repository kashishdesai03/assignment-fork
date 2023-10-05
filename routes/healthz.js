const express = require("express");
const env = require("dotenv");
env.config();
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DBUSER, // Corrected variable name
  host: process.env.PORT, // Corrected variable name
  database: process.env.DBNAME, // Corrected variable name
  password: process.env.DBPASSWORD, // Corrected variable name
  port: process.env.DBPORT, // Corrected variable name
});
const port = 8080;

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const client = await pool.connect();
    client.release();
    res
      .status(200)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .end();
  } catch (error) {
    res
      .status(503)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .end();
  }
});

router.all("/", (req, res) => {
  res.status(405).end();
});

module.exports = router;
