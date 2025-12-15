const mongoose = require("mongoose")

const studentSchema = mongoose.Schema ({
    fullName: {
        type: String,
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId, ref: "classes",
        required: true
    },
    shift: {
        type: String,
        enum: ["Morning","Noon","AfterNoon","Night", "Khamiis iyo Jimco"],
        required: true
    },
    Parts: {
        type: String,
        enum: ["None","Part 0", "Part 1", "Part 2", "Part 3", "Part 4", "Part 5", "Part 6", "Part 7", "New Top One", "Top One", "Congratulations"],
        default: "None"
    },
    phone: {
        type: Number,
        required: true
    },
    emergencyPhone : {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("students",studentSchema)