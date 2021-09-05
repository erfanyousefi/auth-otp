class RedirectWithAuth {
    GoToIndexIfIsAuth(req, res, next) {
        if (req.isAuthenticated()) {
            return res.status(403).json({
                status : 403, 
                success : false,
                error : "Forbidden",
                message : "شما قبلا وارد حساب کاربری خود شده اید"
            })
        }
        next();
    }
    GoToAuthIfNotAuth(req, res, next) {
        if (!req.isAuthenticated()) {
            return res.status(401).json({
                status : 401, 
                success : false,
                error : "Unauthorized",
                message : "وارد حساب کاربری خود شوید"
            })
        }
        next();
    }
}

module.exports = new RedirectWithAuth()