const express = require('express');
const router = express.Router();
const { handleQuestions } = require('../controllers/questionsController');

router.post('/', handleQuestions);

module.exports = router;
