const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserModel = require("app/models/user");

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
        done(err, user);
    })
});


passport.use("local.phone-login", new LocalStrategy({
    usernameField: "phone",
    passwordField: "code",
    passReqToCallback: true
}, (req, phone, code, done) => {
    UserModel.findOne({
        phone
    }, (err, user) => {
        if (err) {
            return done("ورود به حساب کاربری انجام نشد لطفا بعدا یا مجددا تلاش بفرمائید", null)
        }
        if(user){
            if (user.otp.code+"" === code+"") {
                return done(null, user);
            }else{
                return done({
                    error: "کد ارسال شده صحیح نمیباشد لطفا کد را به درستی وارد کنید"
                }, null)
            } 
        }else {
            return done({
                error: "چنین حساب کاربری وجود ندارد"
            }, null)
        }
    })
}))