const express = require('express');
const loginRouter = express.Router();
const bodyParser = require("body-parser");
const morgan = require('morgan')
const session = require('express-session')
const fs = require("fs");
const jwt = require('jsonwebtoken');

let token = jwt.sign({
    foo: 'bar'
}, 'shhhhh');
const dataForAccessToken = {
    username: user.username,
};


function isAuthenticated(req, res, next) {
    if (req.session.isLoggedIn) next()
    else res.render('login')
}

loginRouter.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true
    }
}))

loginRouter.use(bodyParser.urlencoded({
    extended: false
}))

loginRouter.use(bodyParser.json())

//bcrypt.js-mã hóa
const bcrypt = require('bcrypt');

morgan(':method :url :status :res[content-length] - :response-time ms')

//login
loginRouter.get('/', isAuthenticated, function (req, res) {
    res.render('login', {
        layout: false
    })
})

loginRouter.post("/", function (req, res) {
    let arr

    const {
        email,
        password
    } = req.body;

    const path = './account.json'

    //checkInput
    if (!email) {
        let response = {
            status: 2,
            message: 'Bạn chưa nhập email.'
        }
        return res.render('login', response)
    }

    if (email.indexOf(' ') >= 0 || password.indexOf(' ') >= 0) {
        let response = {
            status: 2,
            message: 'Username và Password không được chứa khoảng trống.'
        }
        return res.render('login', response)
    }

    if (password.length != 6) {
        let response = {
            status: 2,
            message: 'Mời bạn nhập lại Password (6 ký tự).'
        }
        return res.render('login', response)
    }

    if (fs.existsSync(path)) {} else {
        let response = {
            status: 2,
            message: 'Không tìm thấy file lưu dữ liệu!'
        }
        return res.render('login', response)
    }

    try {
        arr = require(path);
    } catch (err) {
        let response = {
            status: 2,
            message: 'File lỗi!'
        }
        return res.render('login', response)
    }

    let acc

    for (const account of arr) {
        if (email == account.email) {
            acc = account;
        }
    }

    if (acc == null) {
        let response = {
            status: 2,
            message: 'Không tìm thấy email!'
        }
        return res.render('login', response)
    } else if (bcrypt.compareSync(password, acc.password)) {
        let response = {
            status: 1,
            message: 'Đăng nhập thành công.'
        }
        req.session.regenerate(function (err) {
            if (err) next(err)
            req.session.isLoggedIn = true
            req.session.save(function (err) {
                if (err) next(err)
            })
        })
        const accessTokenLife = "10s";
        const accessTokenSecret = "ACCESS_TOKEN_SECRET";

        const dataForAccessToken = {
            username: user.username,
        };
        const accessToken = await authMethod.generateToken(
            dataForAccessToken,
            accessTokenSecret,
            accessTokenLife,
        );
        if (!accessToken) {
            return res
                .status(401)
                .send('Đăng nhập không thành công, vui lòng thử lại.');
        }

        return res.render('homePage', response)
    } else {
        let response = {
            status: 2,
            message: 'Sai mật khẩu!'
        }
        return res.render('login', response)
    }
})

module.exports = loginRouter;