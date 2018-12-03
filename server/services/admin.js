"use strict";
const user = require('../models/user');
const error_string = require('../error_string');

let utils= require("../utils");
let socket= utils.getSocket;

class admin_service {    

    static async del(req, res, next) {
        const del_id = req.params.id;
        const msg = req.body.reason;
        let timestamp = new Date();
        timestamp.setHours((timestamp.getHours()+1)%24);
        const isAdmin = utils.isAdmin(req);

        if (isAdmin) {
            try {
                const user_ = await user.getModel().findOne({
                    _id: del_id
                });
                if (!user_) {
                    return next(utils.createError(404, error_string.USER_NOT_FOUND));
                }
                if (user_.admin) {
                    return next(utils.createError(403, error_string.DELETE_ADMIN));
                }
                if (user_.eliminated) {
                    return next(utils.createError(403, error_string.USER_DELETE));
                }

                user_.eliminated = true;
                user_.eliminatedText = msg;
                user_.eliminatedTimeStamp = timestamp;

                await user_.save();
                socket.sendTo(del_id, socket.USER_DELETE, {
                    timestamp: timestamp,
                    reason: msg
                });
                socket.disconnect(del_id);

                return res.status(200).json({
                    error: false,
                    errormessage: ""
                });

            } catch (e) {
                return next(utils.createError(500, error_string.DATABASE_ERROR));
            }
        } else {
            return next(utils.createError(401, error_string.ADMIN_ONLY));
        }
    }

    static async evolve_in_admin(req, res, next) {
        const newadmin_id = req.params.id;
        const isAdmin = utils.isAdmin(req);

        if (isAdmin) {
            const user_ = await user.getModel().findOne({
                _id: newadmin_id
            });
            if (!user_) {
                return next(utils.createError(404, error_string.USER_NOT_FOUND));
            }
            if (user_.eliminated) {
                return next(utils.createError(403, error_string.USER_DELETE));
            }
            if (user_.admin) {
                return next(utils.createError(403, error_string.ALREADY_ADMIN));
            }
            user_.admin = true;
            await user_.save();
            return res.status(200).json({
                error: false,
                errormessage: ""
            });

        } else {
            return next(utils.createError(401, error_string.ADMIN_ONLY));
        }

    }

    static async get_utenti(req, res, next) {
        req.query.skip = parseInt(req.query.skip || "0") || 0;
        req.query.limit = parseInt(req.query.limit || "25") || 25;
        try {
            const isAdmin = utils.isAdmin(req);
            if (!isAdmin) {
                return utils.createError(401, error_string.ADMIN_ONLY);
            }
            const user_list = await user.getModel().find({
                eliminated: false,
                admin: false
            }).skip(req.query.skip).limit(req.query.limit).select('_id').exec();
            let ris = [];
            //usando map non funziona
            for (var i = 0; i < user_list.length; i++) {
                const id = user_list[i];
                try {
                    const u = await utils.getUserInfo(id._id);
                    const r = {
                        id: id._id,
                        nickname: u.user.nickname,
                        win: u.user.win,
                        lose: u.user.lose,
                        ratio: u.user.lose != 0 ? u.user.win / u.user.lose : -1,
                        isOnline: u.isOnline,
                        isAdmin: u.user.admin,
                        isInRoom: u.room != undefined,
                        isInGame: u.game != undefined
                    };
                    //console.log(r)
                    ris.push(r);
                } catch (e) {}

            }
            //console.log(ris);
            return res.status(200).json({
                error: false,
                errormessage: "",
                list: ris
            });
        } catch (e) {
            //console.log(e);
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        }
    }
}

module.exports = admin_service;