const classModel = require("../models/classModel")

const createClass = async (req, res) => {
    try {
        const { classId, className, Parts } = req.body;

        // Validate required fields
        if (!classId || !className) {
            return res.status(400).json({ 
                error: "Class ID and class name are required" 
            });
        }

        // Check if classId already exists
        const existingClass = await classModel.findOne({ classId });
        if (existingClass) {
            return res.status(400).json({ error: "Class with this ID already exists" });
        }

        const newData = new classModel({
            classId,
            className,
            Parts: Parts || "None"
        });

        const saveData = await newData.save();
        res.status(201).json(saveData);
    } catch (error) {
        console.error("Create class error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === 11000) {
            return res.status(400).json({ error: "Class with this ID already exists" });
        }
        res.status(500).json({ error: error.message || "Server error" });
    }
}

// read data
const readClass = async (req, res) => {
    try {
        const getData = await classModel.find().sort({ classId: 1 });
        res.status(200).json(getData);
    } catch (error) {
        console.error("Read class error:", error);
        res.status(500).json({ error: error.message || "Server error" });
    }
}

// update data
const updateClass = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid class ID format" });
        }

        const putData = await classModel.updateOne(
            { _id: id },
            { $set: req.body }
        );

        if (putData.matchedCount === 0) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.status(200).json({ message: "Update Successfully" });
    } catch (error) {
        console.error("Update class error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || "Server error" });
    }
}

const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid class ID format" });
        }

        const removedData = await classModel.deleteOne({ _id: id });

        if (removedData.deletedCount === 0) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.status(200).json({ message: "Delete Successfully" });
    } catch (error) {
        console.error("Delete class error:", error);
        res.status(500).json({ error: error.message || "Server error" });
    }
}

module.exports = { createClass, readClass, updateClass, deleteClass }
