const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");

const Schema = mongoose.Schema;
const Types = mongoose.Schema.Types;
var config = require('../config');

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    secondName: {
        type: String
    },
    role: {
        type: Number,
        default:config.USER_ROLE.USER
    },
    parent: {
        type: String,
        default:null
    },
    created: {
        type: Number,
        default:Date.now()
    },
    active: {
        type: Boolean,
        default: true
    },
    avatar: {
        type: String,
        default: ''
    },
    users: [{
        type: Types.ObjectId,
        ref: 'User',
        default: []
    }],
    projects: [{
        type: Types.ObjectId,
        ref: 'Project',
        default: []
    }],
    token: {
        type: String
    }
});


userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.pre("save", function (next) {
    if (this.isModified("password") || this.isNew) {
        this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10), null);
    }

    next();
});

module.exports = mongoose.model("User", userSchema);
