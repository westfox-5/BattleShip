"use strict";

const room = require('../models/room');
const game = require('../models/game');
const error_string = require('../error_string');

let utils= require("../utils");
let socket= utils.getSocket;

class room_service {
    static async joinMatch(req, res, next) {
        const userId = utils.getUserId(req); // chi ha cliccato partecipa
        const id_room = req.params.id; // la stanza che vuole joinare
        try {
            const user_info = await utils.getUserInfo(userId);

            if (!user_info.user) {
                return next(utils.createError(404, error_string.USER_NOT_FOUND));
            }
            if (user_info.user.eliminated) {
                return next(utils.createError(401, error_string.USER_DELETE));
            }
            if (!user_info.isOnline) {
                return next(utils.createError(412, error_string.USER_NOT_ONLINE));
            }
            if (user_info.room) {
                return next(utils.createError(412, error_string.YOUR_ROOM));
            }
            if (user_info.game) {
                return next(utils.createError(412, error_string.USER_IN_GAME));
            }
            const room_ = await room.getModel().findOneAndDelete({
                _id: id_room
            });
            if (!room_) {
                return next(utils.createError(404, error_string.ROOM_NOT_FOUND));
            }
            const host_user_id = room_.host_id;
            socket.sendBroadcast(socket.ROOM_DELETE, {
                _id: id_room,
                host_id: host_user_id
            });
            await game.newGame({
                player1_id: host_user_id,
                player2_id: userId,
                turn: Math.floor(Math.random() * 2) + 1
            }).save();

            socket.sendTo(host_user_id, socket.GAME_START, {
                a_id: userId,
                a_nickname: utils.getUserNickname(req)
            });

            res.status(200).json({
                error: false,
                message: ""
            });
        } catch (e) {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        }
    }



    static async cancelRoom(req, res, next) {
        const userId = utils.getUserId(req);
        try {
            let room_ = await room.getModel().findOneAndDelete({
                host_id: userId
            });
            if (!room_) {
                return next(utils.createError(404, error_string.ROOM_NOT_FOUND));
            }
            socket.sendBroadcast(socket.ROOM_DELETE, {
                _id: room_._id,
                host_id: userId
            });
            return res.status(200).json({
                error: false,
                errormessage: ""
            });
        } catch (e) {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        }
    }

    static async host(req, res, next) {
        const userId = utils.getUserId(req);

        try {
            const user_info = await utils.getUserInfo(userId);

            if (!user_info.user) {
                return next(utils.createError(404, error_string.USER_NOT_FOUND));
            }
            if (user_info.user.eliminated) {
                return next(utils.createError(401, error_string.USER_DELETE));
            }
            if (!user_info.isOnline) {
                return next(utils.createError(412, error_string.USER_NOT_ONLINE));
            }
            if (user_info.room) {
                return next(utils.createError(412, error_string.ROOM_FOUND));
            }
            if (user_info.game) {
                return next(utils.createError(412, error_string.USER_IN_GAME));
            }
            const ratio = user_info.user.lose === 0 ? 0 : user_info.user.win / user_info.user.lose;
            const newRoom = room.newRoom({
                host_id: userId,
                nickname: user_info.user.nickname,
                ratio: ratio
            });
            await newRoom.save();
            socket.sendBroadcast(socket.ROOM, {
                _id: newRoom._id,
                host_id: user_info.user._id,
                nickname: user_info.user.nickname,
                ratio: ratio
            });

            return res.status(200).json({
                error: false,
                messaggio: ""
            });
        } catch (e) {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        }
    }


    static get_hosts(req, res, next) {
        req.query.skip = parseInt(req.query.skip || "0") || 0;
        req.query.limit = parseInt(req.query.limit || "20") || 20;
        room.getModel().find().skip(req.query.skip).limit(req.query.limit).then((list) => {
            return res.status(200).json({
                error: false,
                message: "",
                rooms: list
            });
        }).catch((reason) => {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        });
    }
}


module.exports = room_service;