const express = require("express");
const Assignment = require("../models/Assignment");
const authenticateBasicAuth = require("../middleware/authenticateBasicAuth");
// Middleware to parse JSON request bodies using body-parser

const router = express.Router();

// GET /v1/assignments - Get List of All assignments (Authenticated)
router.get("/", authenticateBasicAuth, async (req, res) => {
  try {
    const assignments = await Assignment.findAll();
    console.log("kashish", assignments);
    res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Internal Server Error
  }
});

// POST /v1/assignments - Create Assignment (Authenticated)
router.post("/", authenticateBasicAuth, async (req, res) => {
  const { name, points, num_of_attemps, deadline } = req.body;
  console.log("test", req.body);
  try {
    const assignment = await Assignment.create({
      name,
      points,
      num_of_attemps,
      deadline,
    });
    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    res.sendStatus(400); // Bad Request
  }
});

// GET /v1/assignments/:id - Get assignment details (Authenticated)
router.get("/:id", authenticateBasicAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await Assignment.findByPk(id);
    if (assignment) {
      res.status(200).json(assignment);
    } else {
      res.sendStatus(404); // Not Found
    }
  } catch (error) {
    console.error(error);
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
      // Update assignment fields
      assignment.name = name;
      assignment.points = points;
      assignment.num_of_attemps = num_of_attemps;
      assignment.deadline = deadline;
      await assignment.save();
      res.sendStatus(204); // No Content
    } else {
      res.sendStatus(404); // Not Found
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(400); // Bad Request
  }
});

// DELETE /v1/assignments/:id - Delete assignment (Authenticated)
router.delete("/:id", authenticateBasicAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await Assignment.findByPk(id);
    if (assignment) {
      await assignment.destroy();
      res.sendStatus(204); // No Content
    } else {
      res.sendStatus(404); // Not Found
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Internal Server Error
  }
});

module.exports = router;
