const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;
const morgan = require('morgan')
const session = require('express-session')

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(bodyParser.json())

morgan(':method :url :status :res[content-length] - :response-time ms')

const handlebars = require("express-handlebars")
const hbs = handlebars.create({
  helpers: {
    formatTimestamp: function (timestamp) {
      return moment.unix(+timestamp).format("DD-MM-YYYY HH:mm:ss")
    }
  }
})
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('public'))

//bcrypt.js-mã hóa
const bcrypt = require('bcrypt');

// app.get('', function (req, res) {
//   res.render("login", {
//     layout: false
//   })
// })

function isAuthenticated(req, res, next) {
  if (req.session.email) next()
  else res.redirect('login')
}

app.get('/', isAuthenticated, function (req, res) {
  return res.redirect("homePage")
})
app.get('/', function (req, res) {
  return res.render("login")
})

app.get('/login', function (req, res) {
  res.render("login", {
    layout: false
  })
})

app.get('/register', function (req, res) {
  res.render("register", {
    layout: false
  })
})

// app.get('/homePage',isAuthenticated, function (req, res, next) {
//   if (req.session.email) next()
//   else res.redirect('login')
// })
app.get('/homePage', isAuthenticated, function (req, res,next) {
  return next()
})
app.get('/homePage', function (req, res) {
  return res.render("homePage")
})

app.get('/logout', function (req, res, next) {
  req.session.email = null
  req.session.save(function (err) {
    if (err) next(err)
    req.session.regenerate(function (err) {
      if (err) next(err)
      res.redirect('/')
    })
  })
})

app.post("/register", function (req, res) {
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
    var arr = require(path);
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
app.post("/login", function (req, res) {
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
    var arr = require(path);
  } catch (err) {
    let response = {
      status: 2,
      message: 'File lỗi!'
    }
    return res.render('login', response)
  }

  for (const account of arr) {
    if (email == account.email) {
      var acc = account;
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
      req.session.email = req.body.email
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

//getAllAccount
// app.get("/getAllAccount", function (req, res) {
//   const path = './account.json';

//   if (fs.existsSync(path)) {} else {
//     return res.send('Không tìm thấy file lưu dữ liệu!');
//   }

//   //check format body file json
//   try {
//     let arr = require(path);
//     return res.send(arr);
//   } catch (err) {
//     return res.send("File lỗi!");
//   }
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});