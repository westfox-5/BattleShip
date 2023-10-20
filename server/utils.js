"use strict";
const jwtDecode = require("jwt-decode");

const user = require("./models/user");
const room = require("./models/room");
const game = require("./models/game");

let socket;

class utils {
  static setSocket(socket_) {
    socket = socket_;
  }

  static get getSocket() {
    return socket;
  }

  static async startDB() {
    try {
      await room.getModel().deleteMany().exec();
      await game.getModel().deleteMany().exec();
      const u = await user
        .getModel()
        .findOne({
          $or: [
            {
              admin: true,
              eliminated: false,
            },
            {
              nickname: process.env.DEFAULT_ADMIN_USERNAME,
            },
          ],
        })
        .exec();
      if (!u) {
        const newUser = user.newUser({
          nickname: process.env.DEFAULT_ADMIN_USERNAME,
          admin: true,
        });
        newUser.setPassword(process.env.DEFAULT_ADMIN_PASSWORD);
        await newUser.save();
      }
    } catch (e) {}
  }

  static createError(code, msg) {
    return {
      statusCode: code,
      error: true,
      message: msg,
    };
  }

  static decodeToken(tk) {
    return jwtDecode(tk);
  }

  static getUserId(req) {
    let tk = req.get("Authorization").split(" ")[1];
    return jwtDecode(tk).id;
  }

  static getUserNickname(req) {
    let tk = req.get("Authorization").split(" ")[1];
    return jwtDecode(tk).nickname;
  }

  static isAdmin(req) {
    return jwtDecode(req.get("Authorization").split(" ")[1]).admin;
  }

  static async getUserInfo(find_id) {
    let ris = {
      user: undefined,
      isOnline: false,
      room: undefined,
      game: undefined,
    };
    //console.log(ris);
    try {
      ris.user = await user
        .getModel()
        .findOne({
          _id: find_id,
        })
        .select("_id nickname win lose admin eliminated")
        .exec();
      if (!ris.user) {
        return ris;
      }
      ris.isOnline = socket.checkIfExist(find_id);
      ris.room = await room
        .getModel()
        .findOne({
          host_id: find_id,
        })
        .exec();

      ris.game = await game
        .getModel()
        .findOne({
          $or: [
            {
              player1_id: find_id,
            },
            {
              player2_id: find_id,
            },
          ],
        })
        .exec();
      return ris;
    } catch (e) {
      return ris;
    }
  }
}

module.exports = utils;
