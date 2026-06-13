const { explain } = require('../services/explainService');

const handleExplain = async (req, res) => {
  try {
    const result = await explain(req.body);
    return res.status(501).json({ message: '/api/explain not yet implemented' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { handleExplain };
