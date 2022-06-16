const express = require("express");
const app = express();
const port = 3000;
const loginRouter = require("./login");
const registerRouter = require("./register");
const handlebars = require("express-handlebars")
const fs = require("fs");
const session = require('express-session')


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

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true
  }
}))

app.use("/login", loginRouter)
app.use("/register", registerRouter)

function isAuthenticated(req, res, next) {
  if (req.session.isLoggedIn) next()
  else res.redirect('login')
}

app.get('/logout', function (req, res, next) {
  req.session.isLoggedIn = 0
  req.session.save(function (err) {
    if (err) next(err)
    req.session.regenerate(function (err) {
      if (err) next(err)
      res.redirect('/')
    })
  })
})

app.get('/', isAuthenticated, function (req, res) {
  return res.redirect("homePage")
})

app.get('/homePage', isAuthenticated, function (req, res) {
  return res.redirect('login')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});