const teacherModel = require("../models/teacherModel")

const createTeacher = async (req,res) =>{
    try {
        const newTeacher = teacherModel(req.body)
        const saveTeacher  = await newTeacher.save()
        if(saveTeacher){
            res.send(saveTeacher)
        }
    } catch (error) {
        console.log(error)
    }
}

const readTeacher = async (req,res) =>{
    const getTeacher = await teacherModel.find()
    .populate("classId", "className")
    if(getTeacher){
        res.send(getTeacher)
    }
}


const updateTeacher = async (req,res) =>{
    const putTeacher = await teacherModel.updateOne(
        {_id: req.params.id},
        {$set: req.body}
    )
    if(putTeacher){
        res.json({message: "Update Successfully"})
    }
}


const deleteTeacher = async (req,res) =>{
    const removeTeacher = await teacherModel.deleteOne({_id: req.params.id})
    if(removeTeacher){
        res.json({message: "Delete SuccessFully"})
    }
}


module.exports = {createTeacher, readTeacher, updateTeacher, deleteTeacher}