const { generateQuestions } = require('../services/questionsService');

const handleQuestions = async (req, res) => {
  try {
    const result = await generateQuestions(req.body);
    return res.status(501).json({ message: '/api/questions not yet implemented' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { handleQuestions };
