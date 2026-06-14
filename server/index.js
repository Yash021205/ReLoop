require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const returnsRouter = require('./routes/returns');
const inspectionRouter = require('./routes/inspection');
const triageRouter = require('./routes/triage');
const marketplaceRouter = require('./routes/marketplace');
const creditsRouter = require('./routes/credits');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const userId = req.headers['x-user-id'];
  req.userId = userId || 'u1';
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'reloop-server' });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/inspection', inspectionRouter);
app.use('/api/triage', triageRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/credits', creditsRouter);
app.use('/api/admin', adminRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Re:Loop Server running on http://localhost:${PORT}`);
});
