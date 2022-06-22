const express = require("express");
const app = express();
const port = 3000;
const handlebars = require("express-handlebars")
const fs = require("fs");
const db = require("./db");
const session = require('express-session')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
const Joi = require('joi');
const mongoose = require('mongoose');
const connectionString = 'mongodb+srv://minhtmu:minhminh@cluster0.zsj9s.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(connectionString);

const loginRequest = new mongoose.Schema({
  username: {
    type: String,
    trim: true
  },
  passwork: {
    type: String
  }
})

const LoginModel = mongoose.model('Acc', loginRequest);
const {
  nextTick
} = require("process");

const hbs = handlebars.create({
  helpers: {
    formatTimestamp: function (timestamp) {
      return moment.unix(+timestamp).format("DD-MM-YYYY HH:mm:ss")
    }
  }
})

const userSchema = Joi.object({
  username: Joi.string().min(3).max(20).trim().required(),
  passwork: Joi.string().min(6).max(20).required()
})

let addUser
app.post('/register', async (req, res, next) => {
  console.log(req)
  const {
    username,
    passwork
  } = req.body
  try {
    const value = await userSchema.validateAsync({
      username: username,
      passwork: passwork
    });
    next()
  } catch (err) {
    return res.status(401).json({
      message: err.message
    })
  }
}, async (req, res) => {
  console.log(req)
  const {
    username,
    passwork
  } = req.body
  const result = await LoginModel.findOne({
    username: username
  })
  console.log(result)
  if (result) {
    return res.status(401).json({
      message: "Tài khoản đã tồn tại"
    })
  } else {
    addUser = new LoginModel({
      username: username,
      passwork: passwork
    });
    addUser.save().then()
    return res.status(200).json({
      message: "Đăng ký thành công"
    })
  }
})

app.post('/login', async (req, res, next) => {
  try {
    const value = await userSchema.validateAsync(req.body);
    next()
  } catch (err) {
    return res.status(401).json({
      message: err.message
    })
  }
}, async (req, res) => {
  const {
    username,
    passwork
  } = req.body
  const result = await LoginModel.findOne({
    username: username,
    passwork: passwork
  })
  if (result) {
    return res.status(200).json({
      message: "Đăng nhập thành công"
    })
  } else return res.status(401).json({
    message: "Tài khoản hoặc mật khẩu không đúng"
  })
})

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('public'))

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true
  }
}))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});