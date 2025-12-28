const teacherModel = require("../models/teacherModel")

const createTeacher = async (req, res) => {
    try {
        // Validate required fields
        const { fullName, email, phone, classId } = req.body;
        
        if (!fullName || !email || !phone || !classId) {
            return res.status(400).json({ 
                error: "All fields (fullName, email, phone, classId) are required" 
            });
        }

        // Check if email already exists
        const existingTeacher = await teacherModel.findOne({ email: email.toLowerCase().trim() });
        if (existingTeacher) {
            return res.status(400).json({ error: "Teacher with this email already exists" });
        }

        const newTeacher = new teacherModel({
            fullName,
            email: email.toLowerCase().trim(),
            phone,
            classId
        });
        
        const saveTeacher = await newTeacher.save();
        res.status(201).json(saveTeacher);
    } catch (error) {
        console.error("Create teacher error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || "Server error" });
    }
}

const readTeacher = async (req, res) => {
    try {
        const getTeacher = await teacherModel.find()
            .populate("classId", "className");
        res.status(200).json(getTeacher);
    } catch (error) {
        console.error("Read teacher error:", error);
        res.status(500).json({ error: error.message || "Server error" });
    }
}

const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid teacher ID format" });
        }

        const putTeacher = await teacherModel.updateOne(
            { _id: id },
            { $set: req.body }
        );
        
        if (putTeacher.matchedCount === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        
        res.status(200).json({ message: "Update Successfully" });
    } catch (error) {
        console.error("Update teacher error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || "Server error" });
    }
}

const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid teacher ID format" });
        }

        const removeTeacher = await teacherModel.deleteOne({ _id: id });
        
        if (removeTeacher.deletedCount === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        
        res.status(200).json({ message: "Delete Successfully" });
    } catch (error) {
        console.error("Delete teacher error:", error);
        res.status(500).json({ error: error.message || "Server error" });
    }
}

module.exports = { createTeacher, readTeacher, updateTeacher, deleteTeacher }