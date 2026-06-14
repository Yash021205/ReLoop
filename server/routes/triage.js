const express = require('express');
const service = require('../services/reloopService');

const router = express.Router();

router.get('/pathways', async (req, res, next) => {
  try {
    const config = await service.getConfig('triagePathways', { pathways: [] });
    res.json({ pathways: config.pathways });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/evaluate', async (req, res, next) => {
  try {
    res.json(await service.runTriage(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.get('/:id/result', async (req, res, next) => {
  try {
    res.json(await service.getTriageResult(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/re-triage', async (req, res, next) => {
  try {
    res.json(await service.runTriage(req.params.id, true));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
