const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Route imports
const interceptRoutes = require('./routes/interceptRoutes');
const inspectRoutes = require('./routes/inspectRoutes');
const questionsRoutes = require('./routes/questionsRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const triageRoutes = require('./routes/triageRoutes');
const explainRoutes = require('./routes/explainRoutes');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');

// Mount routes
app.use('/api/intercept', interceptRoutes);
app.use('/api/inspect', inspectRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/explain', explainRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Re:Loop server running on port ${PORT}`);
});
