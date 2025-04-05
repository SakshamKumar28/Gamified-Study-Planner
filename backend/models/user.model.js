const mongoose = require("mongoose");


// models/User.ts or User.js
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastCompletedDate: Date,
  achievements: [String], // Array of badge IDs or names
  totalTasksCompleted: { type: Number, default: 0 },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields}
  });

  
  module.exports = mongoose.model("User", userSchema);