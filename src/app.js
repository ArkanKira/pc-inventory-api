const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { nodeEnv } = require('./config/env');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(helmet());
app.use(cors());
if (nodeEnv === 'development') app.use(morgan('dev'));

// Health check — public
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/users', require('./modules/user/user.routes'));
app.use('/api/v1/categories', require('./modules/category/category.routes'));
app.use('/api/v1/products', require('./modules/product/product.routes'));
app.use('/api/v1/stock-movements', require('./modules/stockMovement/stockMovement.routes'));

// 404 — must be after all routes
app.use(notFound);

// Central error handler — must be last, with 4 args
app.use(errorHandler);

module.exports = app;