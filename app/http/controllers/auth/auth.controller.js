const Controller = require('app/http/controllers/controllers')
const AuthService = require(`app/http/controllers/auth/auth.service`)
const authService = new AuthService();
const passport = require("passport");

class AuthController extends Controller {
    async getOtp(req, res, next) {
        authService.getOtp(req, res, next)
    }
    async checkOtp(req, res, next) {
       authService.checkOtp(req, res, next);
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
                        return res.json({
                            status: false,
                            message: "ورود به حساب کاربری انجام نشد لطفا مجددا یا بعدا تلاش بفرمائید",
                            data: ""
                        })
                    }
                    if (user) {
                        let expires = user.otp.expires;
                        let diff = new Date(expires) - new Date(Date.now())
                        if (diff < 0) {
                            return res.json({
                                status: false,
                                message: "کد شما منقضی شده لطفا ارسال مجدد کد را بزنید",
                                data: ""
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
                        return res.json({
                            status: false,
                            message: "چنین حساب کاربری وجود ندارد",
                            data: ""
                        })
                    }
                })
            }
        })(req, res, next)
    }
}

module.exports = new AuthController()