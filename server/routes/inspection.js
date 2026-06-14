const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const service = require('../services/reloopService');

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', req.params.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { files: 8, fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    cb(null, file.mimetype.startsWith('image/'));
  },
});

router.get('/:id/requirements', async (req, res, next) => {
  try {
    res.json(await service.getInspectionRequirements(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/upload', upload.array('images'), async (req, res, next) => {
  try {
    res.json(await service.recordUploadedImages(req.params.id, req.files || [], req));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/validate-image', async (req, res, next) => {
  try {
    res.json(await service.validateImage(req.params.id, req.body.imageUrl));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/vision', async (req, res, next) => {
  try {
    res.json(await service.runVision(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/questions', async (req, res, next) => {
  try {
    res.json(await service.getFollowUpQuestions(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/answers', async (req, res, next) => {
  try {
    res.json(await service.submitAnswers(req.params.id, req.body.answers || {}));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/verify-claim', async (req, res, next) => {
  try {
    res.json(await service.verifyClaim(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.get('/:id/profile', async (req, res, next) => {
  try {
    res.json(await service.getProductProfile(req.params.id));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
