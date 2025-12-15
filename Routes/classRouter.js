const classController = require("../Controllers/classController")
const express = require("express")
const route = express.Router()

route.post("/class",classController.createClass)
route.get("/read/class",classController.readClass)
route.put("/update/class/:id",classController.updateClass)
route.delete("/delete/class/:id",classController.deleteClass)




module.exports = route