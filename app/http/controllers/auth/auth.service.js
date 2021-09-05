const Controller = require("app/http/controllers/controllers");
const passport = require("passport");
const { validationResult } = require("express-validator")
const UserModel = require('app/models/user');
let errorList = {}
module.exports = class AuthService extends Controller {
    async getOtp(req, res, next) {
        errorList = {}
        const result = validationResult(req)
        if (result.isEmpty()) {
            let { phone } = req.body
            let user = await UserModel.findOne({ phone });
            let otp = {}
            otp.code = this.generateRandomNumber(5);
            otp.expires = new Date(Date.now() + (1000 * 60 * 2));
            if (user) {
                user.otp = otp;
                await user.save(err => {
                    if (!err) {
                        return res.status(200).json({
                            status: 200,
                            success: true,
                            code: otp.code,
                            expires: otp.expires,
                            phone
                        })
                    } else {
                        return res.status(200).json({
                            status: 401,
                            success: false,
                            message: "ورود انجام نشد لطفا بعدا یا مجددا تلاش بفرمائید"
                        })
                    }
                })
            } else {
                UserModel.create({
                    phone,
                    otp
                }, (err, user) => {
                    if (user) {
                        return res.status(200).json({
                            status: 200,
                            success: true,
                            code: otp.code,
                            expires: '2-min',
                            phone
                        })
                    } else {
                        return res.status(200).json({
                            status: 401,
                            success: false,
                            message: "ورود انجام نشد لطفا بعدا یا مجددا تلاش بفرمائید"
                        })
                    }
                })
            }
        } else {
            this.errorHandler(result.errors, errorList)
            res.status(401).json({
                status: 401,
                success: false,
                messages: errorList
            })
        }
    }
    async checkOtp(req, res, next) {
        errorList = {}
        const result = validationResult(req)
        if (result.isEmpty()) {
            let { phone, code } = req.body;
            let result = await UserModel.findOne({ phone });
            if (result) {
                if (result.otp?.code == code) {
                    let expires = result.otp.expires;
                    let diff = new Date(expires) - new Date(Date.now())
                    if (diff < 0) {
                        return res.status(401).json({
                            success: false,
                            status: 401,
                            message: "کد شما منقضی شده لطفا ارسال مجدد کد را بزنید"
                        })
                    } else {
                        this.login(req, res, next);
                    }
                } else {
                    return res.status(403).json({
                        success: false,
                        status: 403,
                        message: "کد ارسال شده صحیح نمیباشد"
                    })
                }

            }
        } else {
            this.errorHandler(result.errors, errorList)
            res.status(401).json({
                status: 401,
                success: false,
                messages: errorList
            })
        }
    }
    login(req, res, next) {
        passport.authenticate("local.phone-login", {
            passReqToCallback: true
        }, (err, user) => {
            if (err) {
                return res.json({
                    status: false,
                    message: err.error,
                    data: ""
                })
            }
            if (user) {
                req.login(user, async err => {
                    if (err) {
                        return res.status(403).json({
                            success: false,
                            status: 403,
                            message: "ورود به حساب کاربری انجام نشد مجددا سعی کنید",
                        })
                    }
                    if (user) {
                        let expires = user.otp.expires;
                        let diff = new Date(expires) - new Date(Date.now())
                        if (diff < 0) {
                            return res.status(401).json({
                                success: false,
                                status: 401,
                                message: "کد شما منقضی شده لطفا ارسال مجدد کد را بزنید",
                            })
                        } else {
                            const token = this.jwtGeneratorCustomer(user._id, user.phone)
                            user.token = token;
                            user.save(err => {
                                if (!err) {
                                    return res.status(200).json({
                                        status: 200,
                                        success: true,
                                        token
                                    })
                                } else {
                                    return res.status(401).json({
                                        status: 401,
                                        success: false,
                                        message: "ورود انجام نشد لطفا مجددا سعی کنید"
                                    })
                                }
                            })
                        }
                    } else {
                        return res.status(403).json({
                            success: false,
                            status: 403,
                            message: "چنین حساب کاربری وجود ندارد",
                        })
                    }
                })
            }
        })(req, res, next)
    }
}