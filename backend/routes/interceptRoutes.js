const express = require('express');
const router = express.Router();
const { handleIntercept } = require('../controllers/interceptController');

router.post('/', handleIntercept);

module.exports = router;
