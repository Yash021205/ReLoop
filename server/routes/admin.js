const express = require('express');
const repo = require('../db/repository');
const service = require('../services/reloopService');

const router = express.Router();

router.get('/dashboard', async (req, res, next) => {
  try {
    res.json(await service.getAdminDashboard());
  } catch (err) {
    next(err);
  }
});

router.get('/returns', async (req, res, next) => {
  try {
    res.json({ returns: repo.byDateDesc(await repo.scanTable('Returns')) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
