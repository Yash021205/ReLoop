const { intercept } = require('../services/interceptService');

const handleIntercept = async (req, res) => {
  try {
    const result = await intercept(req.body);
    return res.status(501).json({ message: '/api/intercept not yet implemented' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { handleIntercept };
