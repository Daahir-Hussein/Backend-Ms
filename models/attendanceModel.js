const mongoose = require("mongoose")

const attendanceSchema = mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "classes",
        required: true
    },
    teacherName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "teachers",
        required:true
    },
    students: [{
        studentName :{
            type: mongoose.Schema.Types.ObjectId,
            ref: "students",
            required:true
        },
        shift:{
            type: String,
            enum: ["Morning","Noon","AfterNoon","Night", "Khamiis iyo Jimco"],
            required: true
        },
        status: {
            type: String,
            enum: ["Present", "Absent", "Late", "Excused"],
            default: "Present",
        },
       date: {
            type: Date,
            default: Date.now,
        }
    }]
})

module.exports = mongoose.model("attendance",attendanceSchema)