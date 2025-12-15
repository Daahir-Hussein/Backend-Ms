const financeModel = require("../models/financeModel");
const studentModel = require("../models/studentModel");
const mongoose = require("mongoose")


// 📌 REPORT 1: Monthly Summary (Total per month)
const monthlyFinanceReport = async (req, res) => {
    try {

        const { month, year } = req.query;

        const matchStage = {};

        if (month) matchStage.month = month;
        if (year) matchStage.year = parseInt(year);

        const report = await financeModel.aggregate([
            { $match: matchStage },   // <-- FILTER HERE! 🔥
            {
                $group: {
                    _id: { month: "$month", year: "$year" },
                    totalAmount: { $sum: "$amountPaid" },
                    countPayments: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": 1 } }
        ]);

        res.send(report);

    } catch (error) {
        res.status(500).send("Error generating monthly report");
    }
};




// 📌 REPORT 2: Student Payments Report
const studentFinanceReport = async (req, res) => {
    try {

        const studentId = req.params.studentId;

        const report = await financeModel.aggregate([
            { $match: { fullName: new mongoose.Types.ObjectId(studentId) }},

            {
                $lookup: {
                    from: "students",
                    localField: "fullName",
                    foreignField: "_id",
                    as: "studentData"
                }
            },
            { $unwind: "$studentData" },

            {
                $group: {
                    _id: "$fullName",
                    studentName: { $first: "$studentData.fullName" },
                    totalPaid: { $sum: "$amountPaid" },
                    payments: {
                        $push: {
                            month: "$month",
                            year: "$year",
                            amountPaid: "$amountPaid",
                            purpose: "$purpose"
                        }
                    }
                }
            }
        ]);

        res.send(report);

    } catch (error) {
        console.log(error);
        res.status(500).send("Error generating student report");
    }
};




// 📌 REPORT 3: Specific Month Report  (Example: February 2025)
const specificMonthReport = async (req, res) => {
    try {
        const { month, year } = req.query;

        const report = await financeModel.find({ month, year })
            .populate("fullName", "fullName")
            .populate("classId", "className");

        res.send(report);

    } catch (error) {
        console.log(error);
        res.status(500).send("Error generating detailed month report");
    }
};



// 📌 REPORT 4: Students Payment Status (Paid/Unpaid)
const studentsPaymentStatus = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        // Get all students with their class information
        const allStudents = await studentModel.find()
            .populate("classId", "className Parts");
        
        // Get all finance records (optionally filtered by month/year)
        let financeQuery = {};
        if (month && year) {
            financeQuery = { month, year: parseInt(year) };
        }
        
        const financeRecords = await financeModel.find(financeQuery)
            .populate("fullName", "fullName")
            .populate("classId", "className");
        
        // Create a map of students who have paid
        const paidStudentIds = new Set();
        const financeByStudent = {};
        
        financeRecords.forEach(record => {
            const studentId = record.fullName._id.toString();
            paidStudentIds.add(studentId);
            if (!financeByStudent[studentId]) {
                financeByStudent[studentId] = [];
            }
            financeByStudent[studentId].push({
                month: record.month,
                year: record.year,
                amountPaid: record.amountPaid,
                purpose: record.purpose,
                datePaid: record.datePaid
            });
        });
        
        // Categorize students into paid and unpaid
        const studentsWithStatus = allStudents.map(student => {
            const studentId = student._id.toString();
            const hasPaid = paidStudentIds.has(studentId);
            
            return {
                _id: student._id,
                fullName: student.fullName,
                classId: student.classId,
                shift: student.shift,
                Parts: student.Parts,
                phone: student.phone,
                emergencyPhone: student.emergencyPhone,
                paymentStatus: hasPaid ? 'paid' : 'unpaid',
                financeRecords: financeByStudent[studentId] || []
            };
        });
        
        // Separate into paid and unpaid arrays
        const paidStudents = studentsWithStatus.filter(s => s.paymentStatus === 'paid');
        const unpaidStudents = studentsWithStatus.filter(s => s.paymentStatus === 'unpaid');
        
        res.json({
            total: studentsWithStatus.length,
            paid: paidStudents.length,
            unpaid: unpaidStudents.length,
            filter: month && year ? { month, year } : 'all',
            students: {
                paid: paidStudents,
                unpaid: unpaidStudents
            },
            all: studentsWithStatus
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    monthlyFinanceReport,
    studentFinanceReport,
    specificMonthReport,
    studentsPaymentStatus
};
