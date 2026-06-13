const { inspect } = require('../services/inspectService');

const handleInspect = async (req, res) => {
  try {
    const result = await inspect(req.body);
    return res.status(501).json({ message: '/api/inspect not yet implemented' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { handleInspect };
