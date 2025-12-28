const financeController = require("../Controllers/financeController")
const express = require("express")
const { authenticate, authorize } = require("../middleware/authMiddleware")

const route = express.Router()

// All routes require authentication and admin role
route.use(authenticate)
route.use(authorize("admin"))

route.post("/finance", financeController.createFinance)
route.get("/read/finance", financeController.getFinance)
route.put("/update/finance/:id", financeController.updateFinance)
route.delete("/delete/finance/:id", financeController.deleteFinance)

module.exports = route