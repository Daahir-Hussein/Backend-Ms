const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// Verify JWT Token
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    if (!process.env.JWT_SECRET) {
      console.error("⚠️  JWT_SECRET is not set in environment variables!");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Check if user still exists
    const user = await userModel.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User no longer exists or is inactive" });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Check if user has required role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(" or ")}` 
      });
    }

    next();
  };
};









