const express = require('express')
const router = express.Router()
const logger = require('../logger')
const {
    User
} = require('../models')

async function checkValueRegister(req, res, next) {
    try {
        const {
            username,
            password
        } = req.body
        const user = await User.findOne({
            username,
            password
        })
        if (user) {
            res.status(401).json({message:'Tài khoản đã tồn tại!'})
        } else next()
    } catch (error) {
        logger.e(error)
        return res.status(400).json({message:'Có lỗi khi đăng ký'})
    }
}

router.post("/register",checkValueRegister, async (req, res) => {
    try {
        const {
            name,
            username,
            password
        } = req.body
        const user = new User({
            name,
            username,
            password
        })
        await user.save()
        return res.json({message: 'Đăng ký thành công. Tên tài khoản: ' + user.username})
    } catch (error) {
        logger.e(error)
        return res.status(400).json({message: 'Có lỗi khi đăng ký tài khoản'})
    }
})

router.post("/login", async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body
        const user = await User.findOne({
            username,
            password
        })
        if (user) {
            req.session.user = user
            return res.json('Đăng nhập thành công!')
        } else return res.status(401).json({message: 'Tài khoản hoặc mật khẩu không đúng!'})
    } catch (error) {
        logger.e(error)
        return res.status(400).json({message: 'Đăng nhập không thành công'})
    }
})

module.exports = router