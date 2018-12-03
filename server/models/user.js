"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");

var userSchema = new mongoose.Schema({
    nickname: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true,
    },
    admin: {
        type: mongoose.SchemaTypes.Boolean,
        required: true,
        default: false
    },
    win: {
        type: mongoose.SchemaTypes.Number,
        default : 0,
        required: true
    },
    lose: {
        type: mongoose.SchemaTypes.Number,
        default : 0,
        required: true
    },
    salt: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    password: { 
        type: mongoose.SchemaTypes.String,
        required: true
    },
    eliminated: {
        type: mongoose.SchemaTypes.Boolean,
        required: true,
        default: false
    },
    eliminatedText:{
        type: mongoose.SchemaTypes.String,
        required: false
    },
    eliminatedTimeStamp: {
        type: mongoose.SchemaTypes.Date,
        required: false
    }
});

userSchema.methods.setPassword = function (pwd) {
    this.salt = crypto.randomBytes(16).toString('hex'); 

    var hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(pwd);
    this.password = hmac.digest('hex'); // The final digest depends both by the password and the salt
};

userSchema.methods.validatePassword = function (pwd) {
    var hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(pwd);
    var digest = hmac.digest('hex');
    return (this.password === digest);
};

userSchema.methods.hasAdminRole = function () {
    return this.admin;
};

userSchema.methods.setAdmin = function () {
    this.admin = true;
};

userSchema.methods.addWin = function () {
    this.win++;
};

userSchema.methods.addLose = function () {
    this.lose++;
};



function getSchema() { 
    return userSchema; 
}

exports.getSchema = getSchema;

var userModel;
function getModel() {
    if (!userModel) {
        userModel = mongoose.model('users', getSchema());
    }
    return userModel;
}
exports.getModel = getModel;
function newUser(data) {
    var _usermodel = getModel();
    var user = new _usermodel(data);
    return user;
}
exports.newUser = newUser;