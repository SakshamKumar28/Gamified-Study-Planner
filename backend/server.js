const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.route.js");
const taskRoutes = require("./routes/tasks.route.js");
const User = require("./models/user.model.js");
const aiRoutes = require("./routes/ai.route.js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log(`Connected to MongoDB ${process.env.MONGODB_URI}`);
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.get("/api/users/leaderboard", async (req, res) => {
  try {
    const users = await User.find({}, "_id username xp").sort({ xp: -1 }).limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



app.put("/api/tasks/reorder", async (req, res) => {
  const { tasks } = req.body;
  for (let task of tasks) {
    await Task.findByIdAndUpdate(task._id, { order: task.order });
  }
  res.json(tasks);
});

app.use("/api/ai", aiRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

