
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { port } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

(async () => {
  await connectDB();
  const server = app.listen(port, () =>
    console.log(`API listening on :${port}`)
  );

  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
    server.close(() => process.exit(1));
  });
})();