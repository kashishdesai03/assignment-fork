const express = require("express");
const fs = require("fs");
const csvParser = require("csv-parser");
const sequelize = require("./db/connection");
const authenticateBasicAuth = require("./middleware/authenticateBasicAuth");
const User = require("./models/User");
const assignmentRoutes = require("./routes/assignments");
const healthzRouter = require("./routes/healthz"); // Import the healthz route
const logger = require("./logger.js");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const app = express();
const port = 8080;

const AWS = require("aws-sdk");
const sns = new AWS.SNS();

app.use(express.json());
app.use(bodyParser.json());
// Read user data from the CSV file and create or update user accounts
// app.get("/transfer", (req, res) => {
fs.createReadStream("./opt/users.csv")
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
        logger.info("User updated successfully:", row.email);
        notifyUserUpdate(existingUser.email);
      } else {
        // If user doesn't exist, create a new user
        await User.create({
          email: row.email,
          first_name: row.first_name,
          last_name: row.last_name,
          // password: hashedPassword,
          password: row.password,
        });
        logger.info("User created successfully:", row.email);
        notifyNewUser(row.email);
      }
    } catch (error) {
      logger.error("Error creating/updating user account:", error);
    }
  })
  .on("end", () => {
    logger.info("CSV file processing finished.");
  });

// Function to send SNS notification for user update
function notifyUserUpdate(userEmail) {
  const message = `User updated: ${userEmail}`;
  publishToSns(message);
}

// Function to send SNS notification for new user creation
function notifyNewUser(userEmail) {
  const message = `New user created: ${userEmail}`;
  publishToSns(message);
}

// Function to publish message to SNS
function publishToSns(message) {
  const params = {
    Message: message,
    TopicArn: "arn:aws:sns:us-east-1:475039881460:mySNSTopic-b4136e8",
  };

  sns.publish(params, (err, data) => {
    if (err) {
      logger.error("Error publishing message to SNS:", err);
    } else {
      logger.info("Message published to SNS:", data);
    }
  });
}

// Mount assignment routes with authentication middleware
app.use("/v2/assignments", authenticateBasicAuth, assignmentRoutes);

// Mount healthz route
app.use("/healthz", healthzRouter); // Mount the healthz route under /healthz path

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error occurred: ${err.stack}`);
  res.status(500).send("Something went wrong!");
});

// Start the Express server
app.listen(port, async () => {
  logger.info(`Server is running on port ${port}`);
  // usersCreate();
  await sequelize.sync({ alter: true }).then(async () => {
    logger.info("Database synchronized successfully.");
  });
});

module.exports = app;
