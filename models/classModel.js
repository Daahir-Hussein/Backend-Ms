const mongoose = require("mongoose")

const classSchema = mongoose.Schema({
    classId:{
        type: Number,
        required: true
    },
    className:{
        type:String,
        required: true
    },
    Parts:{
        type:String,
        enum:["None","Part 0", "Part 1", "Part 2", "Part 3", "Part 4", "Part 5", "Part 6", "Part 7", "New Top One", "Top One"],
        default: "None"
    }
})
module.exports = mongoose.model("classes",classSchema)