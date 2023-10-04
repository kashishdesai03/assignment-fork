const express = require("express");
const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "kashishdesai",
  password: "Flender@1",
  port: "5433",
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
