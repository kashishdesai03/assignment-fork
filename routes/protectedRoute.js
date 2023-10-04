// src/routes/protectedRoute.js
const express = require("express");
const authenticateBasicAuth = require("../middleware/authenticateBasicAuth");

const router = express.Router();

router.get("/", authenticateBasicAuth, (req, res) => {
  // Access granted, handle the request here
  res.json({ message: "Authenticated User" });
});

module.exports = router;
