const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    isCompleted: { type: Boolean, default: false },
    dueDate: { type: Date },
    xp: { type: Number, required: true }, // ✅ XP is required
    priority: { type: String, enum: ["High", "Medium", "Low"] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tags: { type: [String] },
    order: { type: Number },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);
module.exports = Task;
