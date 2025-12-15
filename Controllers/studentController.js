const studentModel = require("../models/studentModel")

// create student

const createStudent = async (req,res) =>{
    try{
        const newStudent = studentModel(req.body)
        const saveStudent = await newStudent.save()
        res.status(201).json(saveStudent)
    }catch (error){
        console.log(error)
        res.status(400).json({ error: error.message })
    }
}

// read Data
const readStudent = async (req,res) =>{
    try{
        const getStudent = await studentModel.find()
        .populate("classId", "className Parts")
        res.json(getStudent)
    }catch (error){
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}

const updateStudent = async (req,res) => {
    try{
        const putData = await studentModel.updateOne(
            {_id: req.params.id},
            {$set: req.body}
        )
        if(putData.matchedCount === 0){
            return res.status(404).json({ error: "Student not found" })
        }
        res.json({ message: "Update Successfully" })
    }catch (error){
        console.log(error)
        res.status(400).json({ error: error.message })
    }
}

const deleteStudent = async (req,res) => {
    try{
        const removedData = await studentModel.deleteOne({_id: req.params.id})
        if(removedData.deletedCount === 0){
            return res.status(404).json({ error: "Student not found" })
        }
        res.json({ message: "Delete Successfully" })
    }catch (error){
        console.log(error)
        res.status(500).json({ error: error.message })
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
        
        res.json({
            message: message,
            updated: updatedCount,
            totalEnglishStudents: students.length,
            details: details
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
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
        
        res.json(students);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {createStudent, readStudent, updateStudent, deleteStudent, progressEnglishParts, searchStudentByName}