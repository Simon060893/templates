const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
var Project = require("./project");

const Schema = mongoose.Schema;
var NotEmptyString = {type: String, minLength: 1,required: true},
    EmtyStr = {type: String,default:null};

const projectSchema = new Schema({
    title: NotEmptyString,
    link: NotEmptyString,
    image: EmtyStr,
    owner: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Number,
        default:Date.now()
    },
    published: {
        type: Boolean,
        default:false
    },
    model:new Schema({
        link:EmtyStr,
        name:EmtyStr ,
        created: {
            type: Number,
            default:Date.now()
        }
    })
});


module.exports = mongoose.model("Project", projectSchema);
