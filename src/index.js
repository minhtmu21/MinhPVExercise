const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const Joi = require('joi');
const Handlebars = require("handlebars");
require("dotenv").config()
const db = require("./db")
const { create } = require('express-handlebars');
const userRouter = require("./router/userRouter")
const taskRouter = require("./router/taskRouter")
const viewRouter = require("./router/viewRouter")
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const port = 3000
const hbs = create({ /* config */ });
app.use(express.static(__dirname + './public'))
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60*60*1000 } }))
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

app.use("/user", userRouter)
app.use("/task", taskRouter)
app.use("/", viewRouter)
app.listen(port, () => {
    console.log("ready")
})