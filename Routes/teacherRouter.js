const express = require("express")
const teacherController = require("../Controllers/teacherController")
const { authenticate, authorize } = require("../middleware/authMiddleware")

const route = express.Router()

// All routes require authentication and admin role
route.use(authenticate)
route.use(authorize("admin"))

route.post("/teacher", teacherController.createTeacher)
route.get("/read/teacher", teacherController.readTeacher)
route.put("/update/teacher/:id", teacherController.updateTeacher)
route.delete("/delete/teacher/:id", teacherController.deleteTeacher)

module.exports = route