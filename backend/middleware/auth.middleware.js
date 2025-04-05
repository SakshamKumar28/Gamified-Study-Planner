const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1]; // Get the token after "Bearer"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // `decoded.id` will be used in routes
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports = authMiddleware;

