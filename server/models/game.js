"use strict";

const mongoose = require("mongoose");
const user = require('../models/user');
const end_game = require('../models/end_game');


const error_string = require('../error_string');

var gameSchema = new mongoose.Schema({
    player1_id: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    player2_id: { 
        type: mongoose.SchemaTypes.String,
        required: true
    },
    board_1: {
        type: mongoose.SchemaTypes.String,
        default: ""
    },
    board_2: {
        type: mongoose.SchemaTypes.String,
        default: ""
    },
    turn: {
        type: mongoose.SchemaTypes.Number, 
        default: 1
    }
});

function check_board(b) {
    let N = 12;
    let campo = [];
    let i, j;
    for (i = 0; i < N; i++) {
        campo[i] = [];
        for (j = 0; j < N; j++) {
            campo[i][j] = true;
        }
    }

    //controllo numero e tipo navi
    const check=[2,2,2,2,3,3,4,4,5];
    let check_b=b.map((v)=>{return v.length});
    check_b.sort();
    let ris=check.join()==check_b.join();
    //let ris = true;

    let z = 0;
    while (ris && z < b.length) {
        let oriz = b[z].orientation == 'orizzontale';
        let x = b[z].row + 1;
        let y = b[z].col + 1;
        let ix = oriz ? 0 : 1;
        let iy = oriz ? 1 : 0;
        let len = b[z].length;
        let cont = 0;

        while (ris && cont < len) {
            ris = x < N - 1 && y < N - 1 && campo[x][y];
            x += ix;
            y += iy;
            cont++;
        }
        if (ris) {
            x = b[z].row + 1;
            y = b[z].col + 1;
            let li = !oriz ? len + 1 : 2;
            let lj = !oriz ? 2 : len + 1;
            for (i = -1; i < li; i++) {
                for (j = -1; j < lj; j++) {
                    campo[x + i][y + j] = false;
                }
            }
        }
        z++;
    }
    return ris;
}

function convert_board(b) {
    let ris = "";
    let campo = [];
    let i, j, z;
    let N = 10;
    for (i = 0; i < N; i++) {
        campo[i] = [];
        for (j = 0; j < N; j++) {
            campo[i][j] = 'M';
        }
    }
    z = 0;
    while (z < b.length) {
        let oriz = b[z].orientation == 'orizzontale';
        let x = b[z].row;
        let y = b[z].col;
        let ix = oriz ? 0 : 1;
        let iy = oriz ? 1 : 0;
        let cont = 0;

        while (cont < b[z].length) {
            campo[x][y] = z + 1;
            x += ix;
            y += iy;
            cont++;
        }
        z++;
    }
    for (i = 0; i < N; i++) {
        campo[i] = campo[i].join();
    }
    return campo.join();
}

// preso la matrice del campo, la codifica in stringa 
//player1 --> boolean
gameSchema.methods.setBoard = function (player1, schema) {
    let ris = {}
    if ((player1 && this.board_1 != "") || (!player1 && this.board_2 != "")) {
        return {
            error: true,
            msg: error_string.GAME_SCHEMA_SENT
        };
    } else if (!check_board(schema)) {
        return {
            error: true,
            msg: error_string.GAME_SCHEMA
        };
    } else {
        if (player1) {
            this.board_1 = convert_board(schema);
        } else {
            this.board_2 = convert_board(schema);
        }
        return {
            error: false,
            turn: this.turn
        };
    }
};


function checkCoord(x) {
    x=parseInt(x, 10);
    return !isNaN(x) && 0<=x && x<10 ;
}


// coordinate cliccate da player. Return boolean se mossa valida o no
gameSchema.methods.move = function (player, x, y) {
    //cambio mossa e controllo
    if (this.turn != player) {
        return {
            error: true,
            msg: error_string.GAME_TURN
        };
    }
    if (!checkCoord(x) || !checkCoord(y)) {
        return {
            error: true,
            msg: error_string.GAME_COOR_NOT_VALID
        };
    }
    let campo = player == 2 ? this.board_1 : this.board_2;
    campo = campo.split(",");
    let c = x * 10 + y;
    if (campo[c].charAt(0) == "C") {
        return {
            error: true,
            msg: error_string.GAME_COOR_HIT
        };
    } else {
        this.turn = player == 1 ? 2 : 1;
        let colpito = "Mare";
        let affondata = false;
        let vinto = false;

        let cella = campo[c];
        campo[c] = "C".concat(campo[c]);
        if (cella.charAt(0) != "M") {
            colpito = "Nave";
            affondata = !campo.includes(cella);
            if(affondata){
                campo = campo.map((e)=> {
                    return e==cella?"CA":e;
                });
            }
            vinto = affondata && campo.every((elem) => {
                return elem == "M" || elem.charAt(0) == "C" 
            });
        }
        campo = campo.join();
        if (player == 2) {
            this.board_1 = campo;
        } else {
            this.board_2 = campo;
        }
        return {
            error: false,
            msg: "",
            colpita: colpito,
            affondata: affondata,
            vinto: vinto
        };
    }
}


function user_aux(id, win) {
    user.getModel().findOne({
        _id: id
    }, (err, u) => {
        if (win) {
            u.addWin();
        } else {
            u.addLose();
        }
        u.save().then((data) => {}).catch((reason) => {});
    });
}

// player che si arrende
gameSchema.methods.surrend = function (player) {
    if (this.board_1 != "" && this.board_2 != "") {
        user_aux(this.player1_id, player == 2);
        user_aux(this.player2_id, player == 1);

        end_game.newEnd_game({
            win_id: player == 1 ? this.player2_id:this.player1_id,
            lose_id: player == 1 ? this.player1_id:this.player2_id,
         timestamp: new Date()}).save();
    }
    this.remove();
}

gameSchema.methods.isPlayerOne = function (player) {
    return player == this.player1_id;
}

function getSchema() {
    return gameSchema;
}

exports.getSchema = getSchema;

var gameModel;
function getModel() {
    if (!gameModel) {
        gameModel = mongoose.model('game', getSchema());
    }
    return gameModel;
}
exports.getModel = getModel;

function newGame(data) {
    var _gameModel = getModel();
    var game = new _gameModel(data);
    return game;
}
exports.newGame = newGame;