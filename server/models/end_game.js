"use strict";

const mongoose = require("mongoose");

var end_gameSchema = new mongoose.Schema({
    win_id: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    lose_id: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    timestamp: {
        type: mongoose.SchemaTypes.Date,
        required: true
    }
});

function getSchema() { 
    return end_gameSchema; 
}

exports.getSchema = getSchema;

var end_gameModel;
function getModel() {
    if (!end_gameModel) {
        end_gameModel = mongoose.model('end_game', getSchema());
    }
    return end_gameModel;
}
exports.getModel = getModel;

function newEnd_game(data) {
    var _end_gameModel = getModel();
    var end_game = new _end_gameModel(data);
    return end_game;
}
exports.newEnd_game = newEnd_game;