const autoBind = require('auto-bind')
const jwt = require("jsonwebtoken");
module.exports = class Middleware {
    constructor() {
        autoBind(this)
    }
    async jwtVerify(jwtToken) {
        try {
            let decode = await jwt.verify(jwtToken, `${process.env.SECRET_STRING}`)
            let expire = decode.exp - decode.iat
            if (expire <= 0) {
                return false;
            } else {
                return true
            }
        } catch (error) {
            return false
        }
    }
    extractToken(req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query?.token) {
            return req.query.token;
        }
        return null;
    }
}