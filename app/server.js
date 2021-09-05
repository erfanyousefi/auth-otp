const express = require('express')
const app = express();
const cors = require('cors')
const http = require('http');
const mongoose = require("mongoose")
const cookieParser = require('cookie-parser');
require('dotenv').config()
const DB_URI = `${process.env.DB_LOCAL_URI}/${process.env.DB_DBNAME}`
const AppRoutes = require("app/routes/routes");
const passport = require('passport');
const session = require("express-session");
const rememberLogin = require("app/http/middlewares/autoLogin");

module.exports = class Application {
    constructor() {
        this.configApplication();
        this.createRouting();
        this.errorHandler()
        this.createServer();
        this.connectToDatabase();
    }
    createServer() {
        const server = http.createServer(app);
        server.listen(process.env.PORT, () => {
            console.log(`run server on port ${process.env.PORT}`);
        })
    }
    connectToDatabase() {
        mongoose.connect(DB_URI, error => {
            if (!error) return console.log('connect to DB successful');
            console.log('cannot connect to DB');
        })
    }
    configApplication() {
        require("app/passport/passport.local.api")
        app.use(express.static('public'))
        app.use(cors())
        app.use(express.json())
        app.use(express.urlencoded({ extended: true }))
        app.use(cookieParser(`${process.env.SECRET_STRING}`))
        app.set(session({
            secret: `${process.env.SECRET_STRING}`,
            resave: true,
            saveUninitialized: true,
            cookie: {
                secure: true
            }
        }));
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(rememberLogin.handle)
    }
    createRouting() {
        app.use(AppRoutes)
        app.use('*', (req, res, next) => {
            res.status(404).json({
                status: 404,
                success: false,
                message: "Not Found"
            })
        })
    }
    errorHandler() {
        app.use((err, req, res, next) => {
            res.status(err.status || 503).json(err)
        })
    }

}