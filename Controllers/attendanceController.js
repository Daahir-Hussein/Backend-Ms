const classModel = require("../models/classModel");
const teacherModel = require("../models/teacherModel");
const studentModel = require("../models/studentModel");
const attendanceModel = require("../models/attendanceModel");

// 📌 Add new attendance
exports.addAttendance = async (req, res) => {
  try {
    const { classId, teacherName, students } = req.body;

    // Validate required fields
    if (!classId) {
      return res.status(400).json({ message: "Class ID is required" });
    }
    if (!teacherName) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "Students array is required and must not be empty" });
    }

    // ✅ Hubi in class iyo teacher ay jiraan
    const classExists = await classModel.findById(classId);
    const teacherExists = await teacherModel.findById(teacherName);

    if (!classExists) {
      return res.status(404).json({ message: "Class not found" });
    }
    if (!teacherExists) {
      return res.status(404).json({ message: `Teacher not found with ID: ${teacherName}` });
    }

    // ✅ Verify that the teacher is assigned to this class
    // Handle both populated (object) and non-populated (ObjectId) classId
    let teacherClassId;
    if (teacherExists.classId) {
      // If classId is populated (object with _id), use _id, otherwise use the value directly
      teacherClassId = teacherExists.classId._id 
        ? teacherExists.classId._id.toString() 
        : teacherExists.classId.toString();
    } else {
      return res.status(403).json({ 
        message: "Teacher is not assigned to any class" 
      });
    }
    
    const requestedClassId = classId.toString();
    
    // Compare the string representations of the ObjectIds
    if (teacherClassId !== requestedClassId) {
      return res.status(403).json({ 
        message: "Only the teacher assigned to this class can take attendance" 
      });
    }

    // ✅ Hubi in attendance hore aan loogu diiwaan gelin maanta
    // Get the date from the first student record, or use today's date
    const attendanceDate = students && students.length > 0 && students[0].date 
      ? new Date(students[0].date)
      : new Date();
    
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await attendanceModel.findOne({
      classId,
      teacherName,
      "students.date": { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingAttendance) {
      return res
        .status(400)
        .json({ message: "Attendance for this class and teacher already exists today" });
    }

    // ✅ Hubi in students id ay sax yihiin
    for (let s of students) {
      if (!s.studentName) {
        return res.status(400).json({ message: "Student ID is required for all students" });
      }
      
      const student = await studentModel.findById(s.studentName);
      if (!student) {
        return res.status(404).json({ message: `Student with ID ${s.studentName} not found` });
      }

      // Validate shift if provided
      if (s.shift) {
        const validShifts = ["Morning", "Noon", "AfterNoon", "Night", "Khamiis iyo Jimco"];
        if (!validShifts.includes(s.shift)) {
          return res.status(400).json({ message: `Invalid shift value: ${s.shift}` });
        }
      }

      // Validate status if provided
      if (s.status) {
        const validStatuses = ["Present", "Absent", "Late", "Excused"];
        if (!validStatuses.includes(s.status)) {
          return res.status(400).json({ message: `Invalid status value: ${s.status}` });
        }
      }
    }

    // ✅ Save attendance
    const attendance = new attendanceModel({
      classId,
      teacherName,
      students,
    });

    await attendance.save();

    res.status(201).json({
      message: "Attendance saved successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Get all attendances
exports.getAllAttendances = async (req, res) => {
  try {
    const attendances = await attendanceModel.find()
      .populate("classId", "className")
      .populate("teacherName", "fullName")
      .populate("students.studentName", "fullName")
      .sort({ _id: -1 });

    res.status(200).json(attendances);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Get attendance by class and date
exports.getAttendanceByClass = async (req, res) => {
  try {
    const { classId, date } = req.params;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await attendanceModel.findOne({
      classId,
      "students.date": { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("classId", "className")
      .populate("teacherName", "fullName")
      .populate("students.studentName", "fullName");

    if (!attendance) {
      return res.status(404).json({ message: "No attendance found for that class on that date" });
    }

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Update student attendance status
exports.updateStudentStatus = async (req, res) => {
  try {
    const { attendanceId, studentId, status } = req.body;

    // Validate required fields
    if (!attendanceId || !studentId || !status) {
      return res.status(400).json({ message: "attendanceId, studentId, and status are required" });
    }

    // Validate status
    const validStatuses = ["Present", "Absent", "Late", "Excused"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    // Validate ObjectId format
    if (!attendanceId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid attendance ID format" });
    }

    const attendance = await attendanceModel.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    const studentRecord = attendance.students.find(
      (s) => s.studentName.toString() === studentId
    );

    if (!studentRecord) {
      return res.status(404).json({ message: "Student not found in this attendance" });
    }

    studentRecord.status = status;
    await attendance.save();

    res.status(200).json({ message: "Status updated successfully", data: attendance });
  } catch (error) {
    console.error("Update student status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
