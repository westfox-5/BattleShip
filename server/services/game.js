"use strict";
const game = require('../models/game');
const error_string = require('../error_string');

const utils= require("../utils");
const socket= utils.getSocket;

async function findGame(user_id) {
    return await game.getModel().findOne({
        $or: [{
            'player1_id': user_id
        }, {
            'player2_id': user_id
        }]
    });
}


class game_service {

    static  async start(req, res, next) {

        let user_id = utils.getUserId(req);
        try {
            const game_ = await findGame(user_id);
            if (!game_) {
                return next(utils.createError(404, error_string.GAME_NOT_FOUND));
            }
            const player1 = game_.isPlayerOne(user_id);
            const ris = game_.setBoard(player1, req.body);
            if (ris.error) {
                return next(utils.createError(412, ris.msg));
            }

            await game_.save();
            socket.sendTo(player1 ? game_.player2_id : game_.player1_id, socket.GAME, {
                player: 'ready'
            });

            return res.status(200).json({
                error: false,
                message: "",
                turn: player1 && ris.turn == 1 || !player1 && ris.turn == 2,
            });
        } catch (e) {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        }
    }

    static async move(req, res, next) {
        let userID = utils.getUserId(req);
        try {
            const game_ = await findGame(userID);
            if (!game_) {
                return next(utils.createError(404, error_string.GAME_NOT_FOUND));
            }
            let player1 = game_.isPlayerOne(userID);
            let ris = game_.move(player1 ? 1 : 2, req.body.row, req.body.col);

            if (ris.error) {
                return next(utils.createError(412, ris.msg));
            } else {
                const p1 = game_.player1_id;
                const p2 = game_.player2_id;
                await game_.save();
                if (ris.vinto) {
                    await game_.surrend(player1 ? 2 : 1)
                }

                socket.sendTo(player1 ? p2 : p1, socket.GAME_MOVE, {
                    coordX: req.body.row,
                    coordY: req.body.col,
                    colpita: ris.colpita,
                    affondata: ris.affondata,
                    vinto: ris.vinto
                });

                return res.status(200).json(ris);
            }
        } catch (e) {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        }
    }

    static async surrender(req, res, next) {
        let userID = utils.getUserId(req);
        try {
            const game_ = await findGame(userID);
            if (!game_) {
                return next(utils.createError(404, error_string.GAME_NOT_FOUND));
            }
            let player1 = game_.player1_id == userID;
            game_.surrend(player1 ? 1 : 2);
            socket.sendTo(player1 ? game_.player2_id : game_.player1_id, socket.GAME_SURRENDER, {});
            return res.status(200).json({
                error: false,
                message: "",
            });
        } catch (e) {
            return next(utils.createError(500, error_string.DATABASE_ERROR));
        }

    }

}

module.exports = game_service;