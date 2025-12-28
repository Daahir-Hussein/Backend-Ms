const classController = require("../Controllers/classController")
const express = require("express")
const { authenticate, authorize } = require("../middleware/authMiddleware")

const route = express.Router()

// All routes require authentication and admin role
route.use(authenticate)
route.use(authorize("admin"))

route.post("/class", classController.createClass)
route.get("/read/class", classController.readClass)
route.put("/update/class/:id", classController.updateClass)
route.delete("/delete/class/:id", classController.deleteClass)

module.exports = route