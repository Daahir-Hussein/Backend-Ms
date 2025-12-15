const classModel = require("../models/classModel")

const createClass = async (req,res) =>{
    try {
    const newData = classModel(req.body)
    const saveData =await newData.save()
    if(saveData){
        res.send(saveData)
    }
    }catch(error){
        console.log(error)
    }
}

// read data
const readClass = async (req,res) =>{
    const getData = await classModel.find()
    if(getData){
        res.send(getData)
    }
}

// update data
const updateClass = async (req,res) => {
    const putData = await classModel.updateOne(
        {_id: req.params.id},
        {$set : req.body}
    )
    if(putData){
        res.json({ message: "Update Successfully"})
    }
}

const deleteClass = async (req,res) =>{
    const removedData = await classModel.deleteOne({_id: req.params.id})
    if(removedData){
        res.json({message:"delete Successfully"})
    }
}








module.exports = {createClass, readClass, updateClass, deleteClass}