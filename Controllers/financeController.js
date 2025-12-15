const financeModel = require("../models/financeModel")

const createFinance = async (req,res) =>{
    try {
        const addFinance = financeModel(req.body)
        const saveFinance = await addFinance.save()
        if (saveFinance){
            res.send(saveFinance)
        }
    } catch (error) {
        res.send("Duplicate Accor", console.log(error))
    }
}

const getFinance = async (req,res) =>{
    try {
        const readFinance = await financeModel.find()
            .populate("fullName", "fullName")
            .populate("classId", "className Parts")
        if(readFinance){
            res.send(readFinance)
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}

const updateFinance = async (req,res) => {
    const putData = await financeModel.updateOne(
        {_id: req.params.id},
        {$set: req.body}
    )
    if(putData){
        res.json({message: "Update Successfully"})
    }
}

const deleteFinance = async (req,res) => {
    const removedData = await financeModel.deleteOne({_id: req.params.id})
    if(removedData){
        res.json({message: "Delete Successfully"})
    }else{
        res.json({message: "Delete Failed"})
    }
}

module.exports = {createFinance,getFinance,updateFinance,deleteFinance}