const classController = require("../Controllers/classController")
const express = require("express")
const { authenticate, authorize } = require("../middleware/authMiddleware")

const route = express.Router()

// All routes require authentication
route.use(authenticate)

// GET endpoint accessible to both admin and teacher roles
route.get("/read/class", authorize("admin", "teacher"), classController.readClass)

// CREATE, UPDATE, DELETE require admin role only
route.post("/class", authorize("admin"), classController.createClass)
route.put("/update/class/:id", authorize("admin"), classController.updateClass)
route.delete("/delete/class/:id", authorize("admin"), classController.deleteClass)

module.exports = route