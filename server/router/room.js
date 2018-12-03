"use strict";

const express = require('express');
const router = express.Router();

const room_service=require("../services/room");



router.post('/', room_service.host);
router.get('/', room_service.get_hosts);
router.delete('/', room_service.cancelRoom);
router.post('/:id', room_service.joinMatch);



module.exports = router;