const financeModel = require("../models/financeModel")
const studentModel = require("../models/studentModel")
const classModel = require("../models/classModel")

const createFinance = async (req, res) => {
    try {
        const { fullName, classId, month, year, amountPaid, purpose } = req.body;

        // Validate required fields
        if (!fullName || !classId || !month || !year || !amountPaid || !purpose) {
            return res.status(400).json({ 
                error: "All fields (fullName, classId, month, year, amountPaid, purpose) are required" 
            });
        }

        // Validate amount is positive
        if (amountPaid <= 0) {
            return res.status(400).json({ error: "Amount paid must be greater than 0" });
        }

        // Validate student exists
        const student = await studentModel.findById(fullName);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Validate class exists
        const classExists = await classModel.findById(classId);
        if (!classExists) {
            return res.status(404).json({ error: "Class not found" });
        }

        // Validate month and year
        const validMonths = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        if (!validMonths.includes(month)) {
            return res.status(400).json({ error: "Invalid month" });
        }

        if (year < 2000 || year > 2100) {
            return res.status(400).json({ error: "Invalid year" });
        }

        const addFinance = new financeModel({
            fullName,
            classId,
            month,
            year: parseInt(year),
            amountPaid: parseFloat(amountPaid),
            purpose
        });

        const saveFinance = await addFinance.save();
        res.status(201).json(saveFinance);
    } catch (error) {
        console.error("Create finance error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: "Duplicate entry: A finance record with these details already exists" 
            });
        }
        res.status(500).json({ error: error.message || "Server error" });
    }
}

const getFinance = async (req, res) => {
    try {
        const readFinance = await financeModel.find()
            .populate("fullName", "fullName")
            .populate("classId", "className Parts")
            .sort({ datePaid: -1 });
        res.status(200).json(readFinance);
    } catch (error) {
        console.error("Get finance error:", error);
        res.status(500).json({ error: error.message || "Server error" });
    }
}

const updateFinance = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid finance record ID format" });
        }

        // Validate amount if provided
        if (req.body.amountPaid !== undefined && req.body.amountPaid <= 0) {
            return res.status(400).json({ error: "Amount paid must be greater than 0" });
        }

        const putData = await financeModel.updateOne(
            { _id: id },
            { $set: req.body }
        );

        if (putData.matchedCount === 0) {
            return res.status(404).json({ error: "Finance record not found" });
        }

        res.status(200).json({ message: "Update Successfully" });
    } catch (error) {
        console.error("Update finance error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || "Server error" });
    }
}

const deleteFinance = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid finance record ID format" });
        }

        const removedData = await financeModel.deleteOne({ _id: id });

        if (removedData.deletedCount === 0) {
            return res.status(404).json({ error: "Finance record not found" });
        }

        res.status(200).json({ message: "Delete Successfully" });
    } catch (error) {
        console.error("Delete finance error:", error);
        res.status(500).json({ error: error.message || "Server error" });
    }
}

module.exports = { createFinance, getFinance, updateFinance, deleteFinance }