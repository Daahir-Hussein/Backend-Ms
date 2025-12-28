const studentModel = require("../models/studentModel")
const classModel = require("../models/classModel")

// create student
const createStudent = async (req, res) => {
    try {
        const { fullName, classId, shift, Parts, phone, emergencyPhone } = req.body;

        // Validate required fields
        if (!fullName || !classId || !shift || !phone || !emergencyPhone) {
            return res.status(400).json({ 
                error: "All fields (fullName, classId, shift, phone, emergencyPhone) are required" 
            });
        }

        // Validate class exists
        const classExists = await classModel.findById(classId);
        if (!classExists) {
            return res.status(404).json({ error: "Class not found" });
        }

        // Validate shift enum
        const validShifts = ["Morning", "Noon", "AfterNoon", "Night", "Khamiis iyo Jimco"];
        if (!validShifts.includes(shift)) {
            return res.status(400).json({ error: "Invalid shift value" });
        }

        // Validate phone numbers are positive
        if (phone <= 0 || emergencyPhone <= 0) {
            return res.status(400).json({ error: "Phone numbers must be positive numbers" });
        }

        const newStudent = new studentModel({
            fullName,
            classId,
            shift,
            Parts: Parts || "None",
            phone: parseInt(phone),
            emergencyPhone: parseInt(emergencyPhone)
        });

        const saveStudent = await newStudent.save();
        res.status(201).json(saveStudent);
    } catch (error) {
        console.error("Create student error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || "Server error" });
    }
}

// read Data
const readStudent = async (req, res) => {
    try {
        const getStudent = await studentModel.find()
            .populate("classId", "className Parts")
            .sort({ fullName: 1 });
        res.status(200).json(getStudent);
    } catch (error) {
        console.error("Read student error:", error);
        res.status(500).json({ error: error.message || "Server error" });
    }
}

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid student ID format" });
        }

        // If classId is being updated, validate it exists
        if (req.body.classId) {
            const classExists = await classModel.findById(req.body.classId);
            if (!classExists) {
                return res.status(404).json({ error: "Class not found" });
            }
        }

        // If shift is being updated, validate it
        if (req.body.shift) {
            const validShifts = ["Morning", "Noon", "AfterNoon", "Night", "Khamiis iyo Jimco"];
            if (!validShifts.includes(req.body.shift)) {
                return res.status(400).json({ error: "Invalid shift value" });
            }
        }

        const putData = await studentModel.updateOne(
            { _id: id },
            { $set: req.body }
        );

        if (putData.matchedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.status(200).json({ message: "Update Successfully" });
    } catch (error) {
        console.error("Update student error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || "Server error" });
    }
}

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid student ID format" });
        }

        const removedData = await studentModel.deleteOne({ _id: id });

        if (removedData.deletedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.status(200).json({ message: "Delete Successfully" });
    } catch (error) {
        console.error("Delete student error:", error);
        res.status(500).json({ error: error.message || "Server error" });
    }
}

// Progress English students parts - Manual control
// Supports: progress all, progress by specific part(s), or progress specific students
const progressEnglishParts = async (req, res) => {
    try {
        const classModel = require("../models/classModel");
        const { fromParts, studentIds } = req.body; // Optional: fromParts array or studentIds array
        
        // Get all English classes
        const englishClasses = await classModel.find({
            className: { $regex: /english/i }
        });
        
        if (englishClasses.length === 0) {
            return res.json({ 
                message: "No English classes found",
                updated: 0,
                details: {}
            });
        }
        
        const englishClassIds = englishClasses.map(cls => cls._id);
        
        // Build query based on parameters
        let query = { classId: { $in: englishClassIds } };
        
        // If specific student IDs provided, only progress those
        if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
            query._id = { $in: studentIds };
        }
        // If specific parts provided, only progress students in those parts
        else if (fromParts && Array.isArray(fromParts) && fromParts.length > 0) {
            query.Parts = { $in: fromParts };
        }
        
        // Get students matching the query
        const students = await studentModel.find(query).populate("classId", "className");
        
        const partProgression = {
            "Part 0": "Part 1",
            "Part 1": "Part 2",
            "Part 2": "Part 3",
            "Part 3": "Part 4",
            "Part 4": "Part 5",
            "Part 5": "Part 6",
            "Part 6": "Part 7",
            "Part 7": "New Top One",
            "New Top One": "Top One",
            "Top One": "Congratulations"
        };
        
        let updatedCount = 0;
        const details = {
            "Part 0 → Part 1": 0,
            "Part 1 → Part 2": 0,
            "Part 2 → Part 3": 0,
            "Part 3 → Part 4": 0,
            "Part 4 → Part 5": 0,
            "Part 5 → Part 6": 0,
            "Part 6 → Part 7": 0,
            "Part 7 → New Top One": 0,
            "New Top One → Top One": 0,
            "Top One → Congratulations": 0
        };
        
        // Progress each student
        for (const student of students) {
            const currentPart = student.Parts || "None";
            
            // Only progress if student has a valid part (not None or Congratulations)
            if (partProgression[currentPart]) {
                const newPart = partProgression[currentPart];
                await studentModel.updateOne(
                    { _id: student._id },
                    { $set: { Parts: newPart } }
                );
                updatedCount++;
                const progressionKey = `${currentPart} → ${newPart}`;
                if (details[progressionKey] !== undefined) {
                    details[progressionKey]++;
                }
            }
        }
        
        let message = `Successfully progressed ${updatedCount} English student${updatedCount !== 1 ? 's' : ''}`;
        if (fromParts && fromParts.length > 0) {
            message += ` from part${fromParts.length > 1 ? 's' : ''}: ${fromParts.join(', ')}`;
        } else if (studentIds && studentIds.length > 0) {
            message += ` (${studentIds.length} selected student${studentIds.length > 1 ? 's' : ''})`;
        }
        
        res.status(200).json({
            message: message,
            updated: updatedCount,
            totalEnglishStudents: students.length,
            details: details
        });
    } catch (error) {
        console.error("Progress English parts error:", error);
        res.status(500).json({ error: error.message || "Server error" });
    }
}

// Search student by name
const searchStudentByName = async (req, res) => {
    try {
        const { name } = req.query;
        
        if (!name) {
            return res.status(400).json({ error: "Student name is required" });
        }
        
        // Search for students with name matching (case-insensitive)
        const students = await studentModel.find({
            fullName: { $regex: name, $options: 'i' }
        })
        .populate("classId", "className Parts")
        .limit(10); // Limit results to 10
        
        if (students.length === 0) {
            return res.status(404).json({ error: "No student found with that name" });
        }
        
        res.status(200).json(students);
    } catch (error) {
        console.error("Search student error:", error);
        res.status(500).json({ error: error.message || "Server error" });
    }
}

module.exports = {createStudent, readStudent, updateStudent, deleteStudent, progressEnglishParts, searchStudentByName}