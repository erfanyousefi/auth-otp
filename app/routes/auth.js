const router = require('express').Router()
const AuthController = require(`app/http/controllers/auth/auth.controller`);
const AuthValidator = require("app/http/validators/phone")
router.post('/get-otp', AuthValidator.auth(), AuthController.getOtp)
router.post('/check-otp', AuthValidator.checkOtp(), AuthController.checkOtp)
module.exports = router