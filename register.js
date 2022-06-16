const express = require('express');
const registerRouter = express.Router();
const bodyParser = require("body-parser");
const morgan = require('morgan')
const session = require('express-session')
const fs = require("fs");

function isAuthenticated(req, res, next) {
    if (req.session.isLoggedIn) next()
    else res.redirect('login')
}

registerRouter.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true
    }
}))

registerRouter.use(bodyParser.urlencoded({
    extended: false
}))

registerRouter.use(bodyParser.json())

//bcrypt.js-mã hóa
const bcrypt = require('bcrypt');

morgan(':method :url :status :res[content-length] - :response-time ms')

registerRouter.get('/', function (req, res) {
    res.render("register", {
        layout: false
    })
})

registerRouter.post("/", function (req, res) {
    const {
        name,
        email,
        password
    } = req.body;

    let data = [];

    let accNew = {
        name: name,
        email: email,
        password: password
    };

    //checkInput
    if (!email) {
        let response = {
            status: 2,
            message: 'Bạn chưa nhập Email.'
        }
        return res.render('register', response)
    }

    if (!name) {
        let response = {
            status: 2,
            message: 'Bạn chưa nhập Name.'
        }
        return res.render('register', response)
    }

    if (email.indexOf(' ') >= 0 || password.indexOf(' ') >= 0) {
        let response = {
            status: 2,
            message: 'Username và Password không được chứa khoảng trống.'
        }
        return res.render('register', response)
    }

    if (password.length != 6) {
        let response = {
            status: 2,
            message: 'Mời bạn nhập lại Password (6 ký tự).'
        }
        return res.render('register', response)
    }

    //ma hoa
    const bcrypt = require('bcrypt');
    let salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    accNew.password = hash;

    const path = './account.json'

    //check exist file json
    if (fs.existsSync(path)) {} else {
        fs.writeFile(path, JSON.stringify([accNew], null, '\t'), function () {})
        let response = {
            status: 1,
            messageAdd: 'Thêm người dùng thành công!'
        }
        return res.render('login', response)
    }

    //check format body file json
    try {
        arr = require(path);
    } catch (err) {
        let response = {
            status: 2,
            message: 'File lỗi!'
        }
        return res.render('register', response)
    }

    //check exist email
    if (arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].email === email) {
                let response = {
                    status: 2,
                    message: 'Tài khoản ' + email + ' đã tồn tại!'
                }
                return res.render('register', response)
            } else {
                const item = {
                    name: arr[i].name,
                    email: arr[i].email,
                    password: arr[i].password
                };
                data.push(item);
            }
        }

        data.push(accNew);
    } else {
        data.push(accNew);
    }
    fs.writeFileSync(path, JSON.stringify(data, null, '\t'));
    let response = {
        status: 1,
        messageAdd: 'Thêm người dùng thành công!'
    }
    return res.render('login', response)
})

module.exports = registerRouter;