const express = require("express");
const router = express.Router();

const {
    monthlyFinanceReport,
    studentFinanceReport,
    specificMonthReport,
    studentsPaymentStatus
} = require("../Controllers/financeReportController");

router.get("/report/monthly", monthlyFinanceReport);
router.get("/finance/report/student/:id", studentFinanceReport);
router.get("/report/month", specificMonthReport);
router.get("/report/students/payment-status", studentsPaymentStatus);

module.exports = router;
