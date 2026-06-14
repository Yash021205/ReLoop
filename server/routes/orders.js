const express = require('express');
const repo = require('../db/repository');
const service = require('../services/reloopService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const allOrders = await repo.scanTable('Orders');
    let userOrders = allOrders.filter(order => order.userId === req.userId);
    if (userOrders.length === 0) {
      userOrders = await service.seedDefaultOrdersForUser(req.userId);
    }
    res.json({ orders: userOrders });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
