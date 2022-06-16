const express = require('express');
const userRouter = express.Router();
const bodyParser = require("body-parser");
const morgan = require('morgan')
const session = require('express-session')

function isAuthenticated(req, res, next) {
    if (req.session.isLoggedIn) next()
    else res.redirect('login')
}

userRouter.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true
    }
}))

userRouter.use(bodyParser.urlencoded({
    extended: false
}))

userRouter.use(bodyParser.json())

//bcrypt.js-mã hóa
const bcrypt = require('bcrypt');

morgan(':method :url :status :res[content-length] - :response-time ms')


userRouter.get('/register', function (req, res) {
    res.render("register", {
        layout: false
    })
})


userRouter.post("/register", function (req, res) {
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


//login
userRouter.get('/login', function (req, res) {
    console.log('a')
    res.render('login', {
        layout: false
    })
})

userRouter.post("/login", function (req, res) {
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
                if (err) return next(err)
            })
        })
        return res.render('homePage', response)
    } else {
        let response = {
            status: 2,
            message: 'Sai mật khẩu!'
        }
        return res.render('login', response)
    }
})

userRouter.get('/logout', function (req, res, next) {
    req.session.isLoggedIn = 0
    req.session.save(function (err) {
        if (err) next(err)
        req.session.regenerate(function (err) {
            if (err) next(err)
            res.redirect('/')
        })
    })
})


module.exports = userRouter;