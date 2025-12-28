const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/me", authenticate, authController.getCurrentUser);
router.put("/change-password", authenticate, authController.changePassword);

module.exports = router;









