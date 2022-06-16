const jwt = require('jsonwebtoken');
const token = jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    data: 'foobar'
}, 'secret');

console.log(token)

//Làm tiếp login 
//dùng viewRouter , /view, /
//đọc thêm Promise làm lại giao diện như buổi trước login, register
//mongose