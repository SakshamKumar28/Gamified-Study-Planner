const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/user.model.js");

const router = express.Router();

// ✅ Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

// ✅ @route   POST /api/auth/register
// ✅ @desc    Register new user
router.post(
  "/register",
  [
    body("name", "Name is required").notEmpty(),
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({ name, email, password: hashedPassword, xp: 0 }); // Include XP
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(201).json({ 
        token, 
        user: { id: user._id, name: user.name, email: user.email, xp: user.xp } 
      });
    } catch (err) {
      console.error("Register Error:", err);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// ✅ @route   POST /api/auth/login
// ✅ @desc    Authenticate user & get token
router.post(
  "/login",
  [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(200).json({ 
        token, 
        user: { id: user._id, name: user.name, email: user.email, xp: user.xp } 
      });
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// ✅ @route   GET /api/auth/me
// ✅ @desc    Get logged-in user (Protected)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Fetch User Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ @route   GET /api/auth/leaderboard
// ✅ @desc    Get leaderboard (Sorted by XP)
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find().sort({ xp: -1 }).limit(10).select("name xp"); // Get Top 10
    res.json(users);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

// This code is a complete Express.js route for user authentication and management. It includes registration, login, fetching the logged-in user's details, and retrieving a leaderboard of users sorted by XP. The code uses JWT for token-based authentication and bcrypt for password hashing. Validation is done using express-validator.
// The routes are protected by a middleware that verifies the JWT token. The leaderboard route fetches the top 10 users based on their XP. Error handling is included to provide appropriate responses in case of issues.