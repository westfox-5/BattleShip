"use strict";

var express = require('express');
var router = express.Router();

const user_service = require("../services/user");

router.get('/profile', user_service.get_personal_info);
router.get('/scoreboard', user_service.get_classifica);
router.get('/:id', user_service.get_info);

module.exports = router;