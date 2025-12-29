const express = require("express")
const teacherController = require("../Controllers/teacherController")
const { authenticate, authorize } = require("../middleware/authMiddleware")

const route = express.Router()

// All routes require authentication
route.use(authenticate)

// GET endpoint accessible to both admin and teacher roles
route.get("/read/teacher", authorize("admin", "teacher"), teacherController.readTeacher)

// CREATE, UPDATE, DELETE require admin role only
route.post("/teacher", authorize("admin"), teacherController.createTeacher)
route.put("/update/teacher/:id", authorize("admin"), teacherController.updateTeacher)
route.delete("/delete/teacher/:id", authorize("admin"), teacherController.deleteTeacher)

module.exports = route