const financeController = require("../Controllers/financeController")
const express = require("express")

const route = express.Router()

route.post("/finance", financeController.createFinance)
route.get("/read/finance", financeController.getFinance)
route.put("/update/finance/:id", financeController.updateFinance)
route.delete("/delete/finance/:id", financeController.deleteFinance)

module.exports = route