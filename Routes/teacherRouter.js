const express = require("express")
const teacherController = require("../Controllers/teacherController")
const route = express.Router()

route.post("/teacher",teacherController.createTeacher)
route.get("/read/teacher",teacherController.readTeacher)
route.put("/update/teacher/:id",teacherController.updateTeacher)
route.delete("/delete/teacher/:id",teacherController.deleteTeacher)

module.exports = route