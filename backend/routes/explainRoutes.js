const express = require('express');
const router = express.Router();
const { handleExplain } = require('../controllers/explainController');

router.post('/', handleExplain);

module.exports = router;
