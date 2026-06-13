const { verify } = require('../services/verifyService');

const handleVerify = async (req, res) => {
  try {
    const result = await verify(req.body);
    return res.status(501).json({ message: '/api/verify not yet implemented' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { handleVerify };
