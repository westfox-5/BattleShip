"use strict";

const jsonwt = require("jsonwebtoken"); // JWT generation
const user = require("../models/user");
const error_string = require("../error_string");

let utils = require("../utils");
let socket = utils.getSocket;
let secretJWT = process.env.JWT_SECRET;

class auth_service {
  static register(req, res, next) {
    const newUser = user.newUser({ nickname: req.body.nickname });

    if (!req.body.password) {
      return next(utils.createError(412, error_string.USER_MISS_PASSWORD));
    }
    newUser.setPassword(req.body.password);
    newUser
      .save()
      .then((data) => {
        socket.sendBroadcast(socket.USER_OFFLINE, {
          userId: newUser._id,
          nickname: newUser.nickname,
        });

        return res.status(200).json({
          error: false,
          message: "",
          id: data._id,
        });
      })
      .catch((reason) => {
        if (reason.code === 11000)
          return next(utils.createError(409, error_string.USER_EXIST));
        if (reason.code === 17280)
          return next(utils.createError(412, error_string.NICKNAME_INVALID));
        return next(utils.createError(500, error_string.DATABASE_ERROR));
      });
  }

  static autenticazione(nickname, password, done) {
    user.getModel().findOne(
      {
        nickname: nickname,
      },
      (err, user) => {
        if (err) {
          return done(utils.createError(500, error_string.DATABASE_ERROR));
        }
        if (!user) {
          return done(utils.createError(404, error_string.USER_NOT_FOUND));
        }
        if (user.eliminated) {
          return done({
            statusCode: 401,
            error: true,
            message: error_string.USER_DELETE,
            timestamp: user.eliminatedTimeStamp,
            text: user.eliminatedText,
          });
        }
        if (socket.checkIfExist(user._id)) {
          return done(utils.createError(401, error_string.USER_ONLINE));
        }
        if (user.validatePassword(password)) {
          return done(null, user);
        }
        return done(utils.createError(401, error_string.USER_INVALID_PASSWORD));
      }
    );
  }

  static login(req, res, next) {
    var tokendata = {
      id: req.user._id,
      nickname: req.user.nickname,
      admin: req.user.admin,
    };

    console.log(
      "Nuovo login effettuato da " + req.user.nickname + ". Generazione JWT"
    );

    const token = jsonwt.sign(tokendata, secretJWT, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    return res.status(200).json({
      error: false,
      message: "",
      token: token,
    });
  }

  static renew(req, res, next) {
    const id = utils.getUserId(req);
    user.getModel().findOne(
      {
        _id: id,
      },
      (err, user) => {
        if (err) {
          return next(utils.createError(500, error_string.DATABASE_ERROR));
        }
        if (!user) {
          return next(utils.createError(404, error_string.USER_NOT_FOUND));
        }
        if (user.eliminated) {
          return next(utils.createError(401, error_string.USER_DELETE));
        }

        // const tokendata = req.user;
        // delete tokendata.iat;
        // delete tokendata.exp;

        const newToken = {
          id: user._id,
          nickname: user.nickname,
          admin: user.admin,
        };

        //console.log("Rinnovo token per utente", JSON.stringify(tokendata));
        const token_signed = jsonwt.sign(newToken, secretJWT, {
          expiresIn: process.env.JWT_EXPIRE,
        });

        return res.status(200).json({
          error: false,
          errormessage: "",
          token: token_signed,
        });
      }
    );
  }
}

module.exports = auth_service;
