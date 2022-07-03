const express = require('express')
const mongo = require('mongodb')
const router = express.Router()
const logger = require('../logger')
const { Task } = require('../models')

function checkLogin(req,res,next){
    if(req.session.user){
        next()
    } else return res.status(401).json({message: 'Bạn chưa đăng nhập!'})
}

router.post("/",checkLogin, async (req, res) => {
    try {
        const { title, description } = req.body
        const task = new Task({ title, description, status:0, owner:req.session.user._id })
        await task.save()
        return res.json({message:'Thành công',data: task})
    } catch (error) {
        logger.e(error)
        return res.status(400).json({message:'Không thêm mới được task!'})
    }
})

router.get("/",checkLogin, async (req, res) => {
    try {
        const tasks = await Task.find({owner:req.session.user._id})
        return res.json({message: 'Thành công', data:tasks})
    } catch (error) {
        logger.e(error)
        return res.status(400).json({message:'Không tải được danh sách task!'})
    }
})

router.get('/:id',checkLogin, async (req, res) => {
    try {
        const idFind = new mongo.ObjectID(req.params.id)
        const task = await Task.findOne({_id: idFind})
        return res.json({message:'Thành công', data: task})
    } catch (error) {
        logger.e(error)
        return res.status(400).json({message:'Không tải được task có id là: ' + req.params.id})
    }
})

router.delete("/:id",checkLogin, async (req, res) => {
    try {
        const idDelete = new mongo.ObjectID(req.params.id)
        await Task.deleteOne({_id: idDelete})
        return res.json({message:"Xóa thành công"})
    } catch (error) {
        logger.e(error)
        return res.status(400).json({message:'Phát sinh lỗi khi xóa task có Id: ' + idDelete})
    }
})

router.put("/:id",checkLogin, async (req, res) => {
    try {
        const idUpdate = new mongo.ObjectID(req.params.id)
        const { title, description, status } = req.body
        const task = await Task.updateOne({_id: idUpdate},{ title, description, status})
        return res.json({message: 'Sửa task thành công'})
    } catch (error) {
        logger.e(error)
        return res.status(400).json({message: 'Phát sinh lỗi khi sửa task có Id: ' + idUpdate})
    }
})

module.exports = router
