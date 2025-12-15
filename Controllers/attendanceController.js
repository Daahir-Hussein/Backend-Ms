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
    const teacherExists = await teacherModel.findOne({ _id: teacherName });

    if (!classExists) {
      return res.status(404).json({ message: "Class not found" });
    }
    if (!teacherExists) {
      return res.status(404).json({ message: `Teacher not found with ID: ${teacherName}` });
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
      const student = await studentModel.findById(s.studentName);
      if (!student) {
        return res.status(404).json({ message: `Student ${s.studentName} not found` });
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
