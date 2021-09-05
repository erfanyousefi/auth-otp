
const UserModel = require("app/models/user");
const Middleware = require("app/http/middlewares/Middleware")
class AutoLogin extends Middleware {
    async handle(req, res, next) {
        if (!req.isAuthenticated()) {
            const token = req.signedCookies['user-token'] || this.extractToken(req);
            if (token) {
                const isVerify = await this.jwtVerify(token)
                if (isVerify) {
                    this.login(token, req, next)
                } else {
                    return res.status(401).json({
                        status: 401,
                        success: false,
                        error: "Unauthorized",
                        message: "مجددا وارد حساب کاربری خود شوید",
                    });
                }
            }
        }
        next();
    }
    login(token, req, next) {
        UserModel.findOne({ token }, (err, user) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    success: false,
                    error: "Internal Server Error",
                    message: "ورود به حساب کاربری انجام نشد دوباره سعی کنید",
                });
            }
            if (user) {
                req.login(user, err => {
                    if (err) {
                        next({ status: 500, err });
                    }
                    next()
                })
            } else {
                next();
            }
        })
    }
}

module.exports = new AutoLogin()