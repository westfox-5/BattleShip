"use strict";

const mongoose = require("mongoose");

var roomSchema = new mongoose.Schema({
    host_id: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    nickname: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    ratio: {
        type: mongoose.SchemaTypes.Number,
        required: true
    }
});

function getSchema() { 
    return roomSchema; 
}

exports.getSchema = getSchema;

var roomModel;
function getModel() {
    if (!roomModel) {
        roomModel = mongoose.model('room', getSchema());
    }
    return roomModel;
}
exports.getModel = getModel;
function newRoom(data) {
    var _gameModel = getModel();
    var game = new _gameModel(data);
    return game;
}
exports.newRoom = newRoom;
