const router = require('express').Router()
const AuthController = require(`app/http/controllers/api/v1/auth/auth.controller`);
const AuthValidator = require("app/http/validators/api/v1/phone")

module.exports = router