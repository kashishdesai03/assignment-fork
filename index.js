// src/index.js
const express = require("express");
const protectedRoute = require("./routes/protectedRoute");
const app = require("./app"); // Import the Express app from app.js

//const app = express();
const PORT = process.env.PORT || 8080;

// Use the protected route
app.use("/protected", protectedRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
