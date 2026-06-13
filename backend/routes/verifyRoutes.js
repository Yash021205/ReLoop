const express = require('express');
const router = express.Router();
const { handleVerify } = require('../controllers/verifyController');

router.post('/', handleVerify);

module.exports = router;
