const express = require("express")
const attendanceController = require("../Controllers/attendanceController")
const { authenticate } = require("../middleware/authMiddleware")

const route = express.Router()

// All routes require authentication (accessible to both admin and teacher)
route.use(authenticate)

route.post("/attendance", attendanceController.addAttendance)
route.get("/read/attendance", attendanceController.getAllAttendances)
route.get("/readByClass/:classId/:date", attendanceController.getAttendanceByClass)
route.put("/update/attendance", attendanceController.updateStudentStatus)

module.exports = route