const express = require('express');
const router = express.Router();
const { handleInspect } = require('../controllers/inspectController');

router.post('/', handleInspect);

module.exports = router;
