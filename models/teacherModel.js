const mongoose = require("mongoose")

const teacherSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type:String,
        required: true
    },
    phone: {
        type:Number,
        required:true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId, ref: "classes",
        rquired:true
    }

})

module.exports = mongoose.model("teachers",teacherSchema)