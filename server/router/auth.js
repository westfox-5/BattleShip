"use strict";

var express = require('express');
var router = express.Router();
const passportHTTP = require('passport-http'); // implementazione Basic e Digestion auth per HTTP
const passport = require('passport'); // auth middleware per express
const jwt = require('express-jwt'); // JWT parsing middleware per express

const auth_service = require("../services/auth");

const auth = jwt({
    secret: process.env.JWT_SECRET
});

passport.use(new passportHTTP.BasicStrategy(auth_service.autenticazione));
router.get('/', passport.authenticate('basic', {
    session: false
}), auth_service.login);

router.get('/renew', auth, auth_service.renew); //boo
router.post('/', auth_service.register);

module.exports = router;