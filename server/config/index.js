// process.env.NODE_ENV = 'production';
const fs = require("fs");

module.exports = {
    env: process.env.NODE_ENV,
    DIR: {
        PUBLIC: '/resources',
        UPLOADS: 'resources/uploads/',
        PROJECTS: 'projects/',
        IMAGES: 'images/',
        IMG_TYPES: ['webp/', 'low/'],
        ALIGN_IMAGES: 'align_images/',
        SITE_STRUCTURE: '/site_structure.json',
        DELIMETER: '/',
        PROJECT_TEMPLATE: {
            NAME: 'templates/',
            CSS: 'style.css',
            HTML: 'index.html',
            TYPES: ['controls/', 'tooltip/', 'preloader/'],
            _TYPE: {
                PRELOADER: 2,
                TOOLTIP: 1,
                CONTROLS: 0
            }

        }
    },
    FILE_UPLOAD_EXT: ['.obj', 'image/', '.svg'],
    FILE_UPLOAD_ATTR: ['model[]', 'frames[]', 'alignFrames[]', 'structure', 'preloader[]', 'tooltip[]', 'controls[]', 'svgs[]'],
    FILE_UPLOAD_ACCEC: parseInt("0777", 8),
    port: process.env.PORT || 3009,
    mongoose: {
        uri: "mongodb://localhost/oxivisual"
    },
    security: {
        secret: "t45g3w45r34tw5ye454uhdgdf",
        expiresIn: "24h"
    },
    superadmin: {
        email: "superuser@gmail.com",
        password: "superpass"
    },
    help: {
        deleteFolderRecursive: function (path, flag) {
            var _self = this;
            if (fs.existsSync(path)) {
                for (var u = 0, files = fs.readdirSync(path); u < files.length; u++) {
                    var file = files[u],
                        curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        _self.deleteFolderRecursive(curPath, true);
                    } else {
                        fs.unlinkSync(curPath);
                    }
                }
                if (flag)fs.rmdirSync(path);
            }
        },
        randomString: function (l) {

            var length_ = l || 25,
                chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
            if (typeof length_ !== "number") {
                length_ = Math.floor(Math.random() * chars.length_);
            }
            var str = '';
            for (var i = 0; i < length_; i++) {
                str += chars[Math.floor(Math.random() * chars.length)];
            }
            return str + Date.now().toString(32);
        }
    },
    USER_ROLE: {
        SUPER: 1,
        ADMIN: 2,
        USER: 3
    }
};
