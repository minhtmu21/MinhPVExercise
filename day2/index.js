const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;
var morgan = require('morgan')

app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(bodyParser.json())

morgan(':method :url :status :res[content-length] - :response-time ms')

//bcrypt.js-mã hóa
var bcrypt = require('bcrypt');

app.get('/', function (req, res) {
  res.write('HomePage');
  res.write('\n--------------------------------------');
  res.write('\nList routing');
  res.write('\nport /register');
  res.write('\nget  /login');
  res.write('\nget  /getAllAccount');
  res.send();
})

app.post("/register", function (req, res) {
  const {
    username,
    password
  } = req.body;

  let data = [];

  let accNew = {
    username: username,
    password: password
  };

  //checkInput
  if (!username) {
    return res.send('Mời bạn nhập Username.')
  }

  if (username.indexOf(' ') >= 0 || password.indexOf(' ') >= 0) {
    return res.send('Username và Password không được chứa khoảng trống.')
  }

  if (password.length != 6) {
    return res.send('Mời bạn nhập lại Password (6 ký tự).')
  }

  //ma hoa
  var bcrypt = require('bcrypt');
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  accNew.password = hash;

  const path = './account.json'

  //check exist file json
  if (fs.existsSync(path)) {} else {
    fs.writeFile(path, JSON.stringify([accNew],null,'\t'), function () {})
    return res.send("Thêm người dùng thành công (newfile)!");
  }

  //check format body file json
  try {
    var arr = require(path);
  } catch (err) {
    return res.send("File lỗi!")
  }

  //check exist username
  if (arr.length > 0) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].username === username) {
        return res.send('Tài khoản ' + username + ' đã tồn tại!');
      } else {
        const item = {
          username: arr[i].username,
          password: arr[i].password
        };
        data.push(item);
      }
    }

    data.push(accNew);
  } else {
    data.push(accNew);
  }
  fs.writeFileSync(path, JSON.stringify(data,null,'\t'));
  return res.send("Thêm người dùng thành công!");
})

//login
app.get("/login", function (req, res) {
  const {
    username,
    password
  } = req.body;

  const path = './account.json'

  //checkInput
  if (!username) {
    return res.send('Mời bạn nhập Username.')
  }

  if (username.indexOf(' ') >= 0 || password.indexOf(' ') >= 0) {
    return res.send('Username và Password không được chứa khoảng trống.')
  }

  if (password.length != 6) {
    return res.send('Mời bạn nhập lại Passwword (6 ký tự).')
  }

  if (fs.existsSync(path)) {} else {
    return res.send('Không tìm thấy file lưu dữ liệu!');
  }

  try {
    var arr = require(path);
  } catch (err) {
    return res.send("File lỗi!")
  }

  for (const account of arr) {
    if (username == account.username) {
      var acc = account;
    }
  }

  if (acc == null) {
    return res.send('Không tìm thấy username!');
  } else if (bcrypt.compareSync(password, acc.password)) {
    return res.send('Đăng nhập thành công.');
  } else return res.send('Sai mật khẩu!');
})

//getAllAccount
app.get("/getAllAccount", function (req, res) {
  const path = './account.json';

  if (fs.existsSync(path)) {} else {
    return res.send('Không tìm thấy file lưu dữ liệu!');
  }
  
  //check format body file json
  try {
    var arr = require(path);
    return res.send(arr);
  } catch (err) {
    return res.send("File lỗi!");
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});