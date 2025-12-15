const mongoose = require("mongoose")

const financeSchema = mongoose.Schema({
    fullName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "students", 
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "classes", 
        required: true
    },
    month: {
        type: String,
        enum: [
            "January","February","March","April","May","June",
            "July","August","September","October","November","December"
        ],
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        required: true 
    },
    
    purpose: {
        type: String,
        enum: ["Tuition", "Exam", "Registration", "Other"], 
        required: true
    },
    datePaid: {
        type: Date,
        default: Date.now 
    }
    
})
financeSchema.index({fullName: 1, month:1, year:1 }, { unique: true });

module.exports = mongoose.model("finance", financeSchema)
