const jwt = require("jwt-simple");

const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const config = require("../config");

const User = require("../models/user");

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    }, function (req, email, password, done) {
        User.findOne({ email: email }, function (err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, {
                    status: false,
                    message: "No user found."
                });
            }
            if (!user.active) {
                return done(null, false, {
                    status: false,
                    message: "User is not active"
                });
            }

            if (!user.comparePassword(password)) {
                return done(null, false, {
                    status: false,
                    message: "Oops! Wrong password."
                });
            }

            user.token = "JWT " + jwt.encode({ _id: user._id, username: user.username }, config.security.secret);

            user.save(function (err, user) {
                done(null, user, {
                    status: true,
                    message: "Login success."
                });
            });
        });
    }));

    passport.use(new JwtStrategy({
        secretOrKey: config.security.secret,
        jwtFromRequest: ExtractJwt.fromAuthHeader()
    }, function (payload, done) {
        User.findOne({ _id: payload._id }, function (err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, {
                    status: false,
                    message: "Failed to authenticate token."
                });
            }

            done(null, user, {
                status: true,
                message: "Authenticate success."
            });
        });
    }));
};
