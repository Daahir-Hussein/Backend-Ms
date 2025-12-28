const express = require("express");
const router = express.Router();
const attendanceReportController = require("../Controllers/attendanceReportController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

// GET Daily report by class or date
router.get("/attendanceReport/daily", attendanceReportController.getDailyReport);

module.exports = router;
