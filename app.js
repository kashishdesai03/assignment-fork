const express = require("express");
const fs = require("fs");
const csvParser = require("csv-parser");
const sequelize = require("./db/connection");
const authenticateBasicAuth = require("./middleware/authenticateBasicAuth");
const User = require("./models/User");
const assignmentRoutes = require("./routes/assignments");
const healthzRouter = require("./routes/healthz"); // Import the healthz route
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(bodyParser.json());
// Read user data from the CSV file and create or update user accounts
// app.get("/transfer", (req, res) => {
fs.createReadStream("/Users/kashishdesai/Desktop/users.csv")
  .pipe(csvParser())
  .on("data", async (row) => {
    try {
      // Try to find the user by email
      const existingUser = await User.findOne({
        where: {
          email: row.email,
        },
      });

      if (existingUser) {
        // If user exists, update the user's information
        await existingUser.update({
          first_name: row.first_name,
          last_name: row.last_name,
          password: bcrypt.hashSync(row.password, 12),
          // password: hashedPassword,
        });
        console.log("User updated successfully:", row.email);
      } else {
        // If user doesn't exist, create a new user
        await User.create({
          email: row.email,
          first_name: row.first_name,
          last_name: row.last_name,
          // password: hashedPassword,
          password: row.password,
        });
        console.log("User created successfully:", row.email);
      }
    } catch (error) {
      console.error("Error creating/updating user account:", error);
    }
  })
  .on("end", () => {
    console.log("CSV file processing finished.");
  });
// });

// Mount assignment routes with authentication middleware
app.use("/v1/assignments", authenticateBasicAuth, assignmentRoutes);

// Mount healthz route
app.use("/healthz", healthzRouter); // Mount the healthz route under /healthz path

// Start the Express server
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  // usersCreate();
  await sequelize.sync({ alter: true }).then(async () => {
    console.log("Database synchronized successfully.");
  });
});

module.exports = app;
