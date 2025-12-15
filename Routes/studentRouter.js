const express = require("express")
const studentController = require("../Controllers/studentController")

const route = express.Router()

route.post("/student",studentController.createStudent)
route.get("/read/student",studentController.readStudent)
route.get("/search/student",studentController.searchStudentByName)
route.put("/update/student/:id",studentController.updateStudent)
route.delete("/delete/student/:id",studentController.deleteStudent)
route.post("/progress/english-parts",studentController.progressEnglishParts)

module.exports = route