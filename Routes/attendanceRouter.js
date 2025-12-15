const express = require("express")
const attendanceController = require("../Controllers/attendanceController")

const route = express.Router()

route.post("/attendance", attendanceController.addAttendance)
route.get("/read/attendance", attendanceController.getAllAttendances)
route.get("/readByClass/:classId/:date", attendanceController.getAttendanceByClass)
route.put("/update/attendance",attendanceController.updateStudentStatus)

module.exports = route