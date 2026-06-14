const express = require('express');
const repo = require('../db/repository');
const service = require('../services/reloopService');

const router = express.Router();

router.get('/filters', async (req, res, next) => {
  try {
    const config = await service.getConfig('marketplaceFilters', { filters: ['All'] });
    res.json({ filters: config.filters });
  } catch (err) {
    next(err);
  }
});

router.get('/listings', async (req, res, next) => {
  try {
    const { label, category } = req.query;
    let listings = await repo.scanTable('Marketplace');
    if (label) listings = listings.filter(item => item.label === label);
    if (category) listings = listings.filter(item => item.category === category);
    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

router.get('/listings/:id', async (req, res, next) => {
  try {
    const listing = await repo.getItem('Marketplace', req.params.id);
    if (!listing) {
      const error = new Error('Listing not found');
      error.status = 404;
      throw error;
    }
    res.json(listing);
  } catch (err) {
    next(err);
  }
});

router.post('/listings/:id/buy', async (req, res, next) => {
  try {
    const listing = await repo.getItem('Marketplace', req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    // Process purchase
    await repo.deleteItem('Marketplace', req.params.id);
    await service.awardCredits(service.USER_ID, 'marketplace_purchase', 'Purchased Re:Loop Item', 15, '🛒');
    
    if (listing.sourceReturnId) {
      await repo.updateItem('Returns', listing.sourceReturnId, { status: 'Resold' });
    }
    
    res.json({ success: true, message: 'Purchase successful', creditsEarned: 15 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
