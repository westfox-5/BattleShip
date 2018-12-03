"use strict";

var express = require('express');
var router = express.Router();

const admin_service = require("../services/admin");

router.get('/users', admin_service.get_utenti);
router.put('/:id', admin_service.evolve_in_admin);
router.post('/:id', admin_service.del); 

module.exports = router;