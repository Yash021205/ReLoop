const express = require('express');
const repo = require('../db/repository');
const service = require('../services/reloopService');

const router = express.Router();

router.get('/wallet', async (req, res, next) => {
  try {
    res.json(await service.getWallet(req.userId));
  } catch (err) {
    next(err);
  }
});

router.get('/badges', async (req, res, next) => {
  try {
    const wallet = await service.getWallet(req.userId);
    res.json({ badges: wallet.badges || [] });
  } catch (err) {
    next(err);
  }
});

router.get('/rewards', async (req, res, next) => {
  try {
    const rewards = await repo.getItem('Config', 'creditRewards');
    const rules = await repo.getItem('Config', 'creditRules');
    res.json({ rewards: rewards?.rewards || [], rules: rules?.rules || {} });
  } catch (err) {
    next(err);
  }
});

router.post('/redeem', async (req, res, next) => {
  try {
    res.json(await service.redeemCredits(req.body, req.userId));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
