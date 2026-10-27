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


app.use(notFound);
app.use(errorHandler);

module.exports = app;