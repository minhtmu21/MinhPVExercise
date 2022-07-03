const express = require('express')
const router = express.Router()

function isAuthenticated(req, res, next) {
    if (req.session.user)
        next()
    else return res.render('login')
}

router.get("/", isAuthenticated, (req, res) => {
    return res.render("home", {})
})

router.get("/register", (req, res) => {
    return res.render("register", {})
})

router.get("/logout", (req, res) => {
    req.session.user = null
    return res.json("Logout")
})

router.get("/login", isAuthenticated, (req, res) => {
    return res.render("login", {})
})
module.exports = router