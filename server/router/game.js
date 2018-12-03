
"use strict";
const express = require('express');
const router = express.Router();

const game_service = require("../services/game")

router.post('/start', game_service.start);
router.get('/surrender', game_service.surrender);
router.post('/move', game_service.move);

module.exports = router;