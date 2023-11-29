const express = require("express");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const authenticateBasicAuth = require("../middleware/authenticateBasicAuth");
const logger = require("../logger.js");
const AWS = require("aws-sdk");
require("dotenv").config();

const region = process.env.AWS_REGION;
AWS.config.update({ region });

const sns = new AWS.SNS();

const router = express.Router();

const StatsD = require("node-statsd");
const client = new StatsD({
  host: "localhost",
  port: 8125,
});

// GET /v1/assignments - Get List of All assignments (Authenticated)
router.get("/", authenticateBasicAuth, async (req, res) => {
  try {
    const assignments = await Assignment.findAll();
    logger.info("Assignments retrieved successfully:", req.user.email);
    client.increment(req.method + "_" + req.path);
    res.status(200).json(assignments);
  } catch (error) {
    logger.error("Error retrieving assignments:", error);
    client.increment(req.method + "_" + req.path);
    res.sendStatus(500); // Internal Server Error
  }
});

// POST /v1/assignments - Create Assignment (Authenticated)
router.post("/", authenticateBasicAuth, async (req, res) => {
  const { name, points, num_of_attemps, deadline } = req.body;
  console.log("test", req.body);
  try {
    // Extract the authenticated user from req object
    const authenticatedUser = req.user;

    const assignment = await Assignment.create({
      name,
      points,
      num_of_attemps,
      deadline,
      UserId: authenticatedUser.id,
    });
    logger.info("Assignment created successfully:", assignment.name);
    client.increment(req.method + "_" + req.path);
    res.status(201).json(assignment);
  } catch (error) {
    logger.error("Error creating assignment:", error);
    client.increment(req.method + "_" + req.path);
    res.sendStatus(400); // Bad Request
  }
});

// GET /v1/assignments/:id - Get assignment details (Authenticated)
router.get("/:id", authenticateBasicAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await Assignment.findByPk(id);
    if (assignment) {
      logger.info(
        `Assignment retrieved successfully (ID: ${id}):`,
        assignment.name
      );
      client.increment(req.method + "_" + req.path);
      res.status(200).json(assignment);
    } else {
      logger.warn(`Assignment not found (ID: ${id})`);
      client.increment(req.method + "_" + req.path);
      res.sendStatus(404); // Not Found
    }
  } catch (error) {
    logger.error(`Error retrieving assignment (ID: ${id}):`, error);
    client.increment(req.method + "_" + req.path);
    res.sendStatus(500); // Internal Server Error
  }
});

// PUT /v1/assignments/:id - Update assignment (Authenticated)
router.put("/:id", authenticateBasicAuth, async (req, res) => {
  const { id } = req.params;
  const { name, points, num_of_attemps, deadline } = req.body;

  try {
    const assignment = await Assignment.findByPk(id);

    if (assignment) {
      // Check if the authenticated user is the creator of the assignment
      if (assignment.UserId !== req.user.UserId) {
        logger.warn(
          "Unauthorized attempt to update assignment:",
          req.user.email
        );
        client.increment(req.method + "_" + req.path);
        return res.sendStatus(403); // Forbidden
      }

      // Update assignment fields
      assignment.name = name;
      assignment.points = points;
      assignment.num_of_attemps = num_of_attemps;
      assignment.deadline = deadline;

      await assignment.save();
      logger.info("Assignment updated successfully:", assignment.name);
      client.increment(req.method + "_" + req.path);
      res.sendStatus(204); // No Content
    } else {
      logger.warn("Assignment not found for update:", id);
      client.increment(req.method + "_" + req.path);
      res.sendStatus(404); // Not Found
    }
  } catch (error) {
    logger.error("Error updating assignment:", error);
    client.increment(req.method + "_" + req.path);
    res.sendStatus(400); // Bad Request
  }
});

// PATCH /v1/assignments/:id - Update assignment (Method Not Allowed)
router.patch("/:id", (req, res) => {
  res.sendStatus(405); // Method Not Allowed
});

// DELETE /v1/assignments/:id - Delete assignment (Authenticated)
router.delete("/:id", authenticateBasicAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await Assignment.findByPk(id);
    if (assignment) {
      // Check if the authenticated user is the creator of the assignment
      if (assignment.UserId !== req.user.UserId) {
        logger.warn(
          "Unauthorized attempt to delete assignment:",
          req.user.email
        );
        client.increment(req.method + "_" + req.path);
        return res.sendStatus(403); // Forbidden
      }

      await assignment.destroy();
      logger.info("Assignment deleted successfully:", id);
      client.increment(req.method + "_" + req.path);
      res.sendStatus(204); // No Content
    } else {
      logger.warn("Assignment not found for deletion:", id);
      client.increment(req.method + "_" + req.path);
      res.sendStatus(404); // Not Found
    }
  } catch (error) {
    logger.error("Error deleting assignment:", error);
    client.increment(req.method + "_" + req.path);
    res.sendStatus(500); // Internal Server Error
  }
});

// POST /v1/assignments/:id/submission - Submit Assignment (Authenticated)
router.post("/:id/submission", authenticateBasicAuth, async (req, res) => {
  const { id } = req.params;
  const { submission_url } = req.body;

  try {
    // Check if the assignment with the given ID exists
    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      logger.error("Assignment not found.", id);
      return res.status(400).send("Assignment not found.");
    }

    // Check if the assignment is still open for submissions based on the deadline
    const currentDateTime = new Date();
    if (assignment.deadline < currentDateTime) {
      logger.error(
        "Assignment submission deadline has passed:",
        assignment.deadline
      );
      return res.status(400).send("Assignment submission deadline has passed.");
    }

    // Check if the user has exceeded the allowed number of attempts
    if (assignment.num_of_attemps <= 0) {
      logger.error(
        "Exceeded the maximum number of submission attempts:",
        assignment.num_of_attemps
      );
      return res
        .status(403)
        .send("Exceeded the maximum number of submission attempts.");
    }

    // Check if the user making the submission is the creator of the assignment
    if (assignment.UserId !== req.user.id) {
      logger.error(
        "Unauthorized access. User:",
        req.user.id,
        "Assignment User:",
        assignment.UserId
      );
      return res.status(401).send("Unauthorized access.");
    }

    const userEmail = req.user.email;

    try {
      const topicArn = process.env.TopicArn;
      const message = `Submission URL: ${submission_url} for user: ${userEmail}`;
      const params = {
        TopicArn: topicArn,
        Message: message,
      };

      await sns.publish(params).promise();
      console.log("Message published successfully");
    } catch (error) {
      console.error("Error publishing message to SNS:", error);
      throw error;
    }

    const submission = await Submission.create({
      assignment_id: id,
      user_id: req.user.id,
      submission_url,
    });

    await assignment.decrement("num_of_attemps");

    const submissionResponse = {
      id: submission.id,
      assignment_id: submission.assignment_id,
      submission_url: submission.submission_url,
      submission_date: submission.submission_date.toISOString(),
      submission_updated: submission.submission_updated.toISOString(),
    };

    logger.info("Submission successful. Response:", submissionResponse);
    res.status(201).json(submissionResponse);
  } catch (error) {
    logger.error("Submission Error:", error.message);
    res.status(500).send("Submission failed.");
  }
});

module.exports = router;
