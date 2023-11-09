const express = require("express");
const Assignment = require("../models/Assignment");
const authenticateBasicAuth = require("../middleware/authenticateBasicAuth");
const logger = require("../logger.js");

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
      if (assignment.UserId !== req.user.id) {
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

// DELETE /v1/assignments/:id - Delete assignment (Authenticated)
router.delete("/:id", authenticateBasicAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await Assignment.findByPk(id);
    if (assignment) {
      // Check if the authenticated user is the creator of the assignment
      if (assignment.UserId !== req.user.id) {
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

module.exports = router;
