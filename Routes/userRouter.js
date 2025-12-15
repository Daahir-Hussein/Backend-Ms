const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Routes accessible to all authenticated users (must be before admin routes)
router.get("/users/me", authenticate, userController.getMyProfile);
router.put("/users/me", authenticate, userController.updateMyProfile);

// All other routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

// Get all users
router.get("/users", userController.getAllUsers);

// Get teachers without accounts
router.get("/teachers/without-accounts", userController.getTeachersWithoutAccounts);

// Get user by ID
router.get("/users/:id", userController.getUserById);

// Create teacher account
router.post("/users/teacher", userController.createTeacherAccount);

// Update user (admin can update anyone)
router.put("/users/:id", userController.updateUser);

// Delete user
router.delete("/users/:id", userController.deleteUser);

module.exports = router;

