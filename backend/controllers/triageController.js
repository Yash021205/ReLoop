const { triage } = require('../services/triageService');

const handleTriage = async (req, res) => {
  try {
    const result = await triage(req.body);
    return res.status(501).json({ message: '/api/triage not yet implemented' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { handleTriage };
