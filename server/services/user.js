"use strict";

const user = require('../models/user');
const end_game = require('../models/end_game');
const error_string = require('../error_string');

let utils= require("../utils");

class user_service {
    static async get_info(req, res, next) {
        const find_id = req.params.id;
        try {
            const user_info = await utils.getUserInfo(find_id);
            if (!user_info.user) {
                return next(utils.createError(404, error_string.USER_NOT_FOUND));
            }
            if (user_info.user.eliminated) {
                return next(utils.createError(401, error_string.USER_DELETE));
            }

            return res.status(200).json({
                error: false,
                errormessage: "",
                info: {
                    win: user_info.user.win,
                    lose: user_info.user.lose,
                    nickname: user_info.user.nickname,
                    isOnline: user_info.isOnline,
                    isInRoom: user_info.room != undefined,
                    idRoom: user_info.room != undefined ? user_info.room._id : undefined,
                    isInGame: user_info.game != undefined
                }
            });
        } catch (e) {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        }
    }

    static async get_personal_info(req, res, next) {
        req.query.skip = parseInt(req.query.skip || "0") || 0;
        req.query.limit = parseInt(req.query.limit || "25") || 25;
        try {
            const my_id = utils.getUserId(req);
            const end_game_ = await end_game.getModel().find({
                $or: [{
                    'win_id': my_id
                }, {
                    'lose_id': my_id
                }]
            }).sort({
                timestamp: 1
            }).skip(req.query.skip).limit(req.query.limit);
            let win = 0;
            let ris = [];
            for (var i = 0; i < end_game_.length; i++) {
                const g = end_game_[i];
                const w = g.win_id == my_id;
                const t = {
                    win: w,
                    timestamp: g.timestamp,
                    avv_id: w ? g.lose_id : g.win_id,
                    avv_name: (await user.getModel().findOne({
                        _id: w ? g.lose_id : g.win_id
                    }).select('nickname -_id').exec()).nickname
                }
                ris.push(t);
                win += w ? 1 : 0;
            }
            const lose = end_game_.length - win;
            return res.status(200).json({
                error: false,
                errormessage: "",
                info: {
                    win: win,
                    lose: lose,
                    games: ris
                }
            });
        } catch (e) {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        }
    }

    static async get_classifica(req, res, next) {
        const order = req.query.order;

        try {
            const list = await user.getModel().find({
                eliminated: false,
                nickname: {
                    $ne: "Admin"
                }
            }).sort({
                win: -1,
                lose: 1
            }).select('_id nickname win lose').exec();
            if (order == 1) {
                list.sort((b, a) => {
                    return a.win / a.lose - b.win / b.lose
                });
            } else if (order == 2) {
                list.sort((b, a) => {
                    return a.win / (a.win + a.lose) - b.win / (b.win + b.lose)
                });
            }

            const ris = list.splice(0, 10);
            return res.status(200).json({
                error: false,
                errormessage: "",
                list: ris
            });
        } catch (e) {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        }
    }
}

module.exports = user_service