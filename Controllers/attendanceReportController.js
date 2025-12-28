const attendanceModel = require("../models/attendanceModel");

// 📌 Get Daily Report (by class OR date OR both)
exports.getDailyReport = async (req, res) => {
  try {
    const { classId, date, startDate, endDate } = req.query;

    let query = {};

    // Haddii classId la raadinayo
    if (classId) {
      query.classId = classId;
    }

    // Fetch all matching attendance records
    let report = await attendanceModel
      .find(query)
      .populate("classId", "className Parts")
      .populate("teacherName", "fullName")
      .populate("students.studentName", "fullName shift Parts classId");

    // Filter by date range if provided
    if (date || (startDate && endDate)) {
      let start, end;
      
      if (startDate && endDate) {
        // Date range
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      } else if (date) {
        // Single date
        start = new Date(date);
        start.setHours(0, 0, 0, 0);
        end = new Date(date);
        end.setHours(23, 59, 59, 999);
      }

      // Filter attendance records and their students by date
      report = report.map(attendance => {
        const filteredStudents = attendance.students.filter(student => {
          const studentDate = new Date(student.date);
          return studentDate >= start && studentDate <= end;
        });

        // Only include attendance records that have students in the date range
        if (filteredStudents.length > 0) {
          return {
            ...attendance.toObject(),
            students: filteredStudents
          };
        }
        return null;
      }).filter(attendance => attendance !== null);
    }

    res.status(200).json({ success: true, data: report });

  } catch (error) {
    console.error("Attendance report error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Error generating attendance report" 
    });
  }
};
