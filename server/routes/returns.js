const express = require('express');
const repo = require('../db/repository');
const service = require('../services/reloopService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const allReturns = await repo.scanTable('Returns');
    const userReturns = allReturns.filter(r => r.userId === req.userId);
    res.json({ returns: repo.byDateDesc(userReturns) });
  } catch (err) {
    next(err);
  }
});

router.get('/reasons', async (req, res, next) => {
  try {
    const config = await service.getConfig('returnReasons', { reasons: [] });
    res.json({ reasons: config.reasons });
  } catch (err) {
    next(err);
  }
});

router.post('/initiate', async (req, res, next) => {
  try {
    res.json(await service.initiateReturn(req.body, req.userId));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/classify', async (req, res, next) => {
  try {
    res.json(await service.classifyReturn(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/decide', async (req, res, next) => {
  try {
    res.json(await service.decideReturn(req.params.id, req.body.decision));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
