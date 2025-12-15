const express = require("express");
const router = express.Router();
const attendanceReportController = require("../Controllers/attendanceReportController");

// GET Daily report by class or date
router.get("/attendanceReport/daily", attendanceReportController.getDailyReport);

module.exports = router;
