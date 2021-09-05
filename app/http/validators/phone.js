const { body } = require('express-validator')

class AuthValidator {
    auth() {
        return [
            body('phone').isMobilePhone().withMessage('فرمت وارد شده ی شماره موبایل صحیح نمیباشد'),
        ]
    }
    checkOtp() {
        return [
            body('phone').isMobilePhone().withMessage('فرمت وارد شده ی شماره موبایل صحیح نمیباشد'),
            body('code').isLength({min : 5, max : 5}).withMessage('کد صحیح نمیباشد،طول کد باید 5 کاراکتر باشد'),
        ]
    }
}
module.exports = new AuthValidator();