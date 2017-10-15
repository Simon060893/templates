const router = require("express").Router();
const async = require("async");
const config = require("../../config");
var fs = require("fs");

const User = require("../../models/user");
const Project = require("../../models/project");

var saveImage = function (image, avatar, done) {
    function decodeBase64Image(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        var response = {};

        if (matches.length !== 3)
            return new Error('Invalid input string');

        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');

        return response;
    }

    if (!image) {
        if (avatar && avatar.length) {
            var filePath = './resources' + avatar;
            fs.unlinkSync(filePath);
        }
        done(null, '');
        return;
    }

    if (avatar && avatar.length) {
        var filePath = './resources' + avatar;
        fs.unlinkSync(filePath);
    }

    var imageTypeRegularExpression = /\/(.*?)$/;

    var crypto = require('crypto');
    var seed = crypto.randomBytes(20);
    var uniqueSHA1String = crypto.createHash('sha1').update(seed).digest('hex');

    var imageBuffer = decodeBase64Image(image);
    var userUploadedFeedMessagesLocation = 'resources/uploads/img/users/';

    var uniqueRandomImageName = 'image-' + uniqueSHA1String; //uniqueSHA1String;
    var imageTypeDetected = decodeBase64Image(image).type.match(imageTypeRegularExpression);
    var userUploadedImagePath = userUploadedFeedMessagesLocation + uniqueRandomImageName + '.' + imageTypeDetected[1];
    var clientPath = '/uploads/img//users/' + uniqueRandomImageName + '.' + imageTypeDetected[1];

    fs.writeFile(userUploadedImagePath, imageBuffer.data, 'base64', function (err) {
        //console.log('DEBUG - feed:message: Saved to disk image attached by user:', userUploadedImagePath);
        done(err, clientPath);
    });
};

function checkPermissioin(r, rs, next) {
    if (r.body._id == r.user._id || r.user.users.indexOf(r.body._id) > -1 || r.user.role === config.USER_ROLE.SUPER) {
        next();
    } else {
        return rs.json({
            status: false,
            message: "Can`t modify user"
        });
    }
}
router.get("/user/:id", function (req, res) {

    var id = (req.params.id === 'undefined') ? req.user._id : req.params.id;

    async.waterfall([
        function (done) {
            User.findOne({_id: id}, {
                'email': 1,
                'firstName': 1,
                'secondName': 1,
                'created': 1,
                'role': 1,
                //'projects': 1,
                //'users': 1,
                'active': 1,
                'avatar': 1
            }, function (err, user) {
                if (!user) {
                    return done({status: false, message: "No user found."}, null);
                } else if (!user.active) {
                    return done({status: false, message: "User is not active"}, null);
                } else {
                    done(err, user);
                }

            })
        },
        function (user, done) {
            var _populate = ['owner', 'firstName secondName avatar'];
            if (user.role === config.USER_ROLE.SUPER) {
                Project.find({}).populate(_populate[0],_populate[1]).exec( function (err, projects) {
                    user.projects = projects;
                    done(err, user);
                });
            } else if (user.role === config.USER_ROLE.ADMIN) {
                Project.find({owner: user._id}).populate(_populate[0],_populate[1]).exec(function (err, projects) {
                    user.projects = projects;
                    done(err, user);
                });
            } else if (user.role === config.USER_ROLE.USER) {
                Project.find({owner: user.parent}).populate(_populate[0],_populate[1]).exec( function (err, projects) {
                    user.projects = projects;
                    done(err, user);
                })
            } else {
                done(null, user);
            }
        },
        function (user, done) {
            User.find((user.role === config.USER_ROLE.SUPER ? {} : (user.role === config.USER_ROLE.ADMIN ? {$or: [{parent: user._id}, {_id: user._id}]} : {_id: user._id})), {
                'email': 1,
                'firstName': 1,
                'secondName': 1,
                'created': 1,
                'role': 1,
                //'projects': 1,
                //'users': 1,
                'active': 1,
                'avatar': 1
            }, function (err, users) {
                user.users = users;
                done(err, user);
            });
        }
    ], function (err, user) {

        if (err) {
            return res.json({
                status: false,
                res: err.message || err
            });
        } else {
            res.json({
                status: true,
                res: user
            });
        }

    });

});

//update user
router.put("/user", function (req, res) {
    checkPermissioin(req, res, function () {
        var result = 'User was changed ';
        async.waterfall([
            function (done) {
                User.findOne({_id: req.body._id}, {
                    'email': 1,
                    'firstName': 1,
                    'secondName': 1,
                    'created': 1,
                    'role': 1,
                    'active': 1,
                    'avatar': 1
                }, function (err, user) {
                    if (err) {
                        return done({status: false, message: "Undefined error, no user found."}, null);
                    } else if (!user) {
                        return done({status: false, message: "No user found."}, null);
                    } else {
                        if (req.body.oldPassword) {
                            if (!user.comparePassword(req.body.oldPassword)) {
                                return done({status: false, message: "Oops! Wrong password."}, null);
                            } else {
                                user.password = req.body.password;
                                result += ",password successfully was changed";
                            }
                        }
                        if (req.body.active !== user.active) {
                            user.active = req.body.active;
                            result += user.active ? ",user successfully was activated" : ",user successfully was deactivated";
                        }
                        ['firstName', 'secondName'].forEach(function (el) {
                            if (req.body[el]) user[el] = req.body[el];
                        });
                        done(null, user);
                    }

                });

            },
            function (user, done) {
                if (req.body.email !== user.email) {
                    User.findOne({email: req.body.email}, function (err, _result) {
                        if (err) {
                            return done(err, null);
                        } else if (_result) {
                            return done({
                                status: false,
                                email: true,
                                message: "That email is already taken."
                            }, null);
                        } else {
                            result += ", email was updated";
                            user.email = req.body.email;
                            done(null, user);
                        }

                    });
                } else {
                    done(null, user);
                }
            },
            function (user, done) {

                if (req.body.avatar !== user.avatar) {
                    saveImage(req.body.avatar, user.avatar, function (err, img) {
                        result += ", avatar was updated";
                        user.avatar = img;
                        done(err, user);
                    })
                } else {
                    done(null, user);
                }
            }

        ], function (err, resUser) {
            if (err) {
                return res.json({
                    status: false,
                    message: err.message || err
                });
            } else {
                resUser.save(function (err, user) {
                    if (err) {
                        return res.json({
                            status: false,
                            message: err.message || err
                        });
                    } else {
                        return res.json({
                            status: true,
                            res: {
                                avatar: user.avatar
                            },
                            message: result
                        })
                    }

                });
            }
        });
    });


});

//create user
router.post("/user", function (req, res) {
    if (req.user.role === config.USER_ROLE.ADMIN && req.body.role !== config.USER_ROLE.USER || req.user.role === config.USER_ROLE.USER) {
        return res.json({
            status: false,
            message: 'Access denied'
        });
    } else if (!req.body.email || !req.body.password || !req.body.firstName || !req.body.secondName || !req.body.role) {
        return res.json({
            status: false,
            message: "Empty fields."
        });
    } else {
        async.waterfall([
            function (done) {
                User.findOne({email: req.body.email}, function (err, user) {
                    if (err) {
                        return done({
                            status: false,
                            err: err,
                            message: err.message || "That email is already taken."
                        }, null);
                    } else if (user) {
                        return done({status: false, email: true, message: "That email is already taken."}, null);
                    } else {

                        var newUser = new User({
                            email: req.body.email,
                            role: req.body.role,
                            password: req.body.password,
                            firstName: req.body.firstName,
                            secondName: req.body.secondName,
                            parent: req.user._id,
                            avatar: req.body.avatar
                        });
                        done(null, newUser);
                    }

                });
            },
            function (user, done) {

                if (user.avatar) {
                    saveImage(user.avatar, null, function (err, img) {
                        user.avatar = img;
                        done(err, user);
                    })
                } else {
                    done(null, user);
                }

            }
        ], function (err, user) {
            if (err) {
                return res.json({
                    status: false,
                    err: err,
                    message: "Error."
                })
            } else {
                user.save(function (err, user) {
                    if (err) {
                        return res.json({
                            status: true,
                            err: err,
                            message: "User was unsuccessfully created."
                        })
                    } else {
                        User.update({_id: req.user._id}, {$push: {users: user._id}}, function (err) {
                            if (err) {
                                return res.json({
                                    status: false,
                                    message: err ? err : "User was not created."
                                });

                            } else {
                                req.user.users.push(user._id);
                                return res.json({
                                    status: true,
                                    res: user,
                                    message: "User was successfully created."
                                });
                            }
                        });

                    }
                });
            }
        });
    }
});

//delete user
router.delete("/user", function (req, res) {
    if (req.body._id == req.user._id) return res.json({
        status: false,
        message: "Can`t drop self"
    });
    checkPermissioin(req, res, function () {
        User.findOne({_id: req.body._id}, function (err, user) {
            if (err) {
                //return res.json({
                //    status: false,
                //    message: err.message || "No user found"
                //
                //});
                console.log("No user found1");
            } else {
                if (!user) {
                    //return res.json({
                    //    status: false,
                    //    message: "No user found"
                    //});
                    console.log("No user found");
                }
            }


        }).remove().exec(function (err) {
            if (err) {
                return res.json({
                    status: false,
                    message: err.message || "No user found"
                });
            } else {
                User.update({_id: req.user._id},
                    {$pull: {users: {$in: [req.body._id]}}}
                    , function (err) {
                        if (!err && req.user.users.indexOf(req.body._id) > -1)req.user.users.splice(req.user.users.indexOf(req.body._id), 1);
                        res.json({
                            status: !err,
                            message: err ? err.message : "User was successfully deleted"
                        });
                    }
                );
            }
        });
    });

});

module.exports = router;
