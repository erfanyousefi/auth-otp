const router = require('express').Router()
const RedirectWithAuth = require("app/http/middlewares/RedirectWithAuth")
const AuthRoutes = require("app/routes/auth")
router.use('/auth', RedirectWithAuth.GoToIndexIfIsAuth, AuthRoutes)
module.exports = router