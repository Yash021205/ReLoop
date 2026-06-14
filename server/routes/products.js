const express = require('express');
const service = require('../services/reloopService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    res.json({ products: await service.listProducts(req.query.category) });
  } catch (err) {
    next(err);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const config = await service.getConfig('productCategories', { categories: ['All'] });
    res.json({ categories: config.categories });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await service.getProductOrThrow(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/guidance', async (req, res, next) => {
  try {
    res.json(await service.getProductGuidance(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
