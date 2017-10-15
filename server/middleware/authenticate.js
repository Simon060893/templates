const passport = require("passport");

module.exports = function (req, res, next) {
    var token = req.headers["authorization"];

    passport.authenticate("jwt", { session: false }, function (err, user, info) {
        if (err) {
            return res.status(401).json({
                status: false,
                message: err
            });
        }

        if (!user) {
            return res.status(200).json({
                status: false,
                message: info.message
            });
        }

        if (!req.isAuthenticated()) {
            return res.status(200).json({
                status: false,
                message: "Not authenticated"
            });
        }

        if (user.token !== token) {
            return res.status(200).json({
                status: false,
                message: "Expired token"
            });
        }

        next();
    })(req, res, next);
};
