"use strict";

const mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({
    from: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    from_name: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    to: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    to_name: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    timestamp: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    text: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});

function getSchema() {
    return messageSchema;
}

exports.getSchema = getSchema;

var messageModel;
function getModel() {
    if (!messageModel) {
        messageModel = mongoose.model('messages', getSchema());
    }
    return messageModel;
}
exports.getModel = getModel;

function newMessage(data) {
    var _messageModel = getModel();
    var message = new _messageModel(data);
    return message;
}
exports.newMessage = newMessage;