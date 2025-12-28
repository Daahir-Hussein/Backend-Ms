const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");

const {
    monthlyFinanceReport,
    studentFinanceReport,
    specificMonthReport,
    studentsPaymentStatus
} = require("../Controllers/financeReportController");

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

router.get("/report/monthly", monthlyFinanceReport);
router.get("/finance/report/student/:id", studentFinanceReport);
router.get("/report/month", specificMonthReport);
router.get("/report/students/payment-status", studentsPaymentStatus);

module.exports = router;
