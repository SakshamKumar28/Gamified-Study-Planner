const express = require("express");
const Task = require("../models/task.model.js");
const User = require("../models/user.model.js");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth.middleware.js");

const router = express.Router();

// ✅ Create a new task
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, xp } = req.body;
    if (!title || xp === undefined) {
      return res.status(400).json({ message: "Title and XP are required" });
    }

    const newTask = new Task({
      ...req.body,
      user: req.user.id,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error creating task:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get all tasks for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ order: 1 });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Update a task
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(id);

    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Delete a task
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Mark task as complete and award XP
router.patch("/:id/complete", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure the task has a user field
    if (!task.user) {
      return res.status(500).json({ message: "Task is missing the user field" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to complete this task" });
    }

    if (task.isCompleted) {
      return res.status(400).json({ message: "Task already completed" });
    }

    task.isCompleted = true;
    await task.save();

    // Award XP to the user
    const user = await User.findById(req.user.id);
    if (user) {
      user.xp += task.xp || 0;
      await user.save();
    }

    res.json(task);
  } catch (error) {
    console.error("Error completing task:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Reorder tasks
router.put("/reorder", authMiddleware, async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: "Invalid tasks format" });
    }

    const updates = await Promise.all(
      tasks.map((task) => {
        if (!mongoose.Types.ObjectId.isValid(task._id)) {
          throw new Error(`Invalid task ID: ${task._id}`);
        }
        return Task.findOneAndUpdate(
          { _id: task._id, user: req.user.id },
          { order: task.order },
          { new: true }
        );
      })
    );

    res.json(updates);
  } catch (error) {
    console.error("Error reordering tasks:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
