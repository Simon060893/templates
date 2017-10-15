const passport = require("passport");
const router = require("express").Router();
var jwt = require("jwt-simple");
const async = require("async");

var config = require("../../config");

const User = require("../../models/user");

router.all("/", function (req, res, next) {
    res.json({
        status: true,
        message: "Info about auth."
    });
});

router.post("/login", function (req, res, next) {
    var passportCtrl = function () {
        passport.authenticate("local", function (err, user, info) {
            if (err) {
                throw err;
            }

            if (!user) {
                return res.json({
                    status: false,
                    message: info.message || "Email or password is incorrect."
                });
            }

            req.login(user, function (err) {
                if (err) {
                    throw err;
                }

                res.json({
                    status: true,
                    message: "Login success.",
                    token: user.token
                });
            });
        })(req, res, next);
    };

    if ((req.body.email === config.superadmin.email) && (req.body.password === config.superadmin.password)) {
        User.findOne({email: req.body.email}, function (err, user) {
            if (err) {
                return res.json({
                    status: false,
                    message: err && err.message ? err.message : "You are not logged in."
                });
            } else if (user) {
                passportCtrl();
            } else {

                new User({
                    email: config.superadmin.email,
                    password: config.superadmin.password,
                    firstName: "Super",
                    secondName: "User",
                    role: config.USER_ROLE.SUPER,
                    parent: req.user ? req.user._id : null
                }).save(function (err, user) {

                        if (err) {
                            return res.json({
                                status: false,
                                message: err && err.message ? err.message : "You are not logged in."
                            });
                        }

                        user.token = "JWT " + jwt.encode({_id: user._id, email: user.email}, config.security.secret);
                        user.save(function (err, user) {
                            if (err) {
                                throw err;
                            }

                            passportCtrl();
                        });

                    });
            }
        });

    } else {
        passportCtrl();
    }

});

router.post("/logout", function (req, res) {
    if (!req.isAuthenticated()) {
        return res.json({
            status: false,
            message: "You are not logged in."
        });
    }

    req.user.token = "";

    req.user.save(function () {
        req.logout();

        res.json({
            status: true,
            message: "Logout success."
        });
    });
});

module.exports = router;
