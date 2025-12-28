const express = require("express")
const studentController = require("../Controllers/studentController")
const { authenticate, authorize } = require("../middleware/authMiddleware")

const route = express.Router()

// All routes require authentication
route.use(authenticate)

// Read and search routes - accessible to all authenticated users (admin and teacher)
route.get("/read/student", studentController.readStudent)
route.get("/search/student", studentController.searchStudentByName)

// Create, update, delete, and progress routes - admin only
route.post("/student", authorize("admin"), studentController.createStudent)
route.put("/update/student/:id", authorize("admin"), studentController.updateStudent)
route.delete("/delete/student/:id", authorize("admin"), studentController.deleteStudent)
route.post("/progress/english-parts", authorize("admin"), studentController.progressEnglishParts)

module.exports = route