const autoBind = require("auto-bind")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const fs = require('fs')
const path = require("path")
module.exports = class Controller {
    constructor() {
        autoBind(this)
    }
    hashPassword(password) {
        const salt = bcrypt.genSaltSync(15);
        const hashed = bcrypt.hashSync(password, salt);
        return hashed
    }
    setCookie(res, token) {
        res.cookie("user-token", token, { signed: true, httpOnly: true, expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 6)) })
        // res.cookie("refresh-token", this.refreshTokenGenerator(), { signed: true, httpOnly: true, expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 6)) })
    }
    jwtGenerator(id, email) {
        const token = jwt.sign({ id, email }, `${process.env.SECRET_STRING}`, { expiresIn: Date.now() + (1000 * 60 * 60 * 24 * 6), algorithm: "HS256" });
        return token
    }
    jwtGeneratorCustomer(id, phone) {
        const token = jwt.sign({ id, phone }, `${process.env.SECRET_STRING}`, { expiresIn: Date.now() + (1000 * 60 * 60 * 24 * 30), algorithm: "HS256" });
        return token
    }
    async verifyJWTToken(token) {
        return jwt.verify(token, `${process.env.JWT_SECRET}`, { algorithms: "HS256" });
    }
    errorHandler(errors, errorList) {
        Object.values(errors).forEach(err => {
            errorList[err.param] = err.msg;
        })
    }
    generateRandomNumber(length) {
        if (length === 4) {
            return Math.floor(1000 + Math.random() * 9000)
        }
        if (length === 5) {
            return Math.floor(10000 + Math.random() * 90000)
        }
        if (length === 6) {
            return Math.floor(100000 + Math.random() * 900000)
        }
        if (length === 7) {
            return Math.floor(1000000 + Math.random() * 9000000)
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
    async jwtVerify(jwtToken) {
        let decode = await jwt.verify(jwtToken, `${process.env.SECRET_STRING}`);
        let expire = decode.exp - decode.iat
        if (expire <= 0) {
            return false;
        } else {
            return true
        }
    }
    removeEmptyProperty(object) {
        Object.keys(object).forEach(key => {
            if (!object[key] || object[key].length < 1) delete object[key]
        })
    }
    Exception(code) {
        if (code === 200) {
            return {
                status: code,
                success: true,
            }
        } else if (code === 400) {
            return {
                status: code,
                success: false,
                error: 'BadRequest'
            }
        } else if (code === 401) {
            return {
                status: code,
                success: false,
                error: 'Unauthorized'
            }
        } else if (code === 403) {
            return {
                status: code,
                success: false,
                error: 'Forbidden'
            }
        } else if (code === 404) {
            return {
                status: code,
                success: false,
                error: 'NotFound'
            }
        } else if (code === 500) {
            return {
                status: code,
                success: false,
                error: 'InternalServerError'
            }
        } else if (code === 503) {
            return {
                status: code,
                success: false,
                error: 'ServerUnavailable'
            }
        } else {
            return {
                status: 599,
                success: false,
                error: 'SomeThingWrong'
            }
        }
    }
    removeFile(Req_File) {
        if (Req_File) {
            let path = `${Req_File.destination}/${Req_File.filename}`
            if (fs.existsSync(path)) {
                fs.unlinkSync(path, (err) => {
                    if (err) {
                        throw { status: 500, message: 'فایل آپلود شده حذف نشد', err }
                    } else {
                        return true;
                    }
                })
            } else {
                return true;
            }
        }

    }
    getFileName(Req_File) {
        if (Req_File) {
            return path.join(Req_File.destination,Req_File.filename).substring(6);
        }
        return undefined

    }
}