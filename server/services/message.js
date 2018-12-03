"use strict";

const user = require('../models/user');
const message = require('../models/message');
const error_string = require('../error_string');

let utils= require("../utils");
let socket= utils.getSocket;

class message_service {
    static send(req, res, next) {
        user.getModel().findOne({
            _id: req.params.id
        }, (err, user_) => {
            if (err || !user_ || user_.eliminated) {
                return next(utils.createError(404, error_string.DEST_NOT_FOUND));
            }
            let d=new Date();
            d.setHours((d.getHours()+1)%24);
            const msg = {
                from: utils.getUserId(req),
                to: req.params.id,
                timestamp: d,
                text: req.body.text,
                from_name: utils.getUserNickname(req),
                to_name: user_.nickname
            };
            const newMsg = message.newMessage(msg);
            newMsg.save().then((data) => {
                socket.sendTo(msg.to, socket.MESSAGE, msg);
                socket.sendTo(msg.from, socket.MESSAGE, msg);

                return res.status(200).json({
                    error: false,
                    messaggio: ""
                });
            }).catch((reason) => {
                return next(utils.createError(500, error_string.DATABASE_ERROR));
            });
        });
    }

    static getFrom(req, res, next) {
        req.query.skip = parseInt(req.query.skip || "0") || 0;
        req.query.limit = parseInt(req.query.limit || "25") || 25;
        let my_id = utils.getUserId(req);
        let other_id = req.params.id;

        message.getModel().find({
            $or: [{
                'to': my_id,
                'from': other_id
            }, {
                'to': other_id,
                'from': my_id
            }]
        }).sort({
            timestamp: -1
        }).skip(req.query.skip).limit(req.query.limit).then((list) => {
            return res.status(200).json({
                error: false,
                message: "",
                list: list.reverse()
            });
        }).catch((reason) => {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        });
    }

    static async get(req, res, next) {
        req.query.skip = parseInt(req.query.skip || "0") || 0;
        req.query.limit = parseInt(req.query.limit || "25") || 25;
        const my_id = utils.getUserId(req);
        try {
            let to = await message.getModel().aggregate([{
                    $match: {
                        'to': my_id
                    }
                },
                {
                    $group: {
                        _id: '$from',
                        timestamp: {
                            $max: '$timestamp'
                        }
                    }
                }
            ]).exec();

            let from = await message.getModel().aggregate([{
                    $match: {
                        'from': my_id
                    }
                },
                {
                    $group: {
                        _id: '$to',
                        timestamp: {
                            $max: '$timestamp'
                        }
                    }
                }
            ]).exec();

            to = to.filter((v) => {
                const i = from.findIndex((u) => {
                    return u._id == v._id
                });
                if (i != -1) {
                    const c = v.timestamp > from[i].timestamp;
                    if (c) {
                        from.splice(i, 1);
                    }
                    return c;
                }
                return true;
            });

            const user_msg_list = to.concat(from);
            const user_list = await user.getModel().find({
                '_id': {
                    $ne: my_id
                },
                'eliminated': false

            }).select('_id nickname').exec();
            const list = user_list.map((v) => {
                const t = user_msg_list.find((u) => {
                    return u._id == v._id
                });
                return {
                    isOnline: socket.checkIfExist(v._id),
                    timestamp: t ? t.timestamp : -1,
                    id: v._id,
                    nickname: v.nickname
                }
            });

            list.sort((a, b) => {
                return a.timestamp < b.timestamp
            });

            return res.status(200).json({
                error: false,
                message: "",
                list: list.splice(req.query.skip, req.query.skip + req.query.limit)
            });
        } catch (e) {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        }
    }
}



module.exports = message_service;