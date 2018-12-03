"use strict";

var express = require('express');
var router = express.Router();

const message_service=require("../services/message");

router.post('/:id', message_service.send);
router.get('/', message_service.get);
router.get('/:id', message_service.getFrom);

module.exports = router;
