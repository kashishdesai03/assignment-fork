const express = require("express");
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER, // Corrected variable name
  host: process.env.DB_HOST, // Corrected variable name
  database: process.env.DB_NAME, // Corrected variable name
  password: process.env.DB_PASSWORD, // Corrected variable name
  port: process.env.DB_PORT, // Corrected variable name
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
