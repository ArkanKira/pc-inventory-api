const { admin } = require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  await connectDB();

  if (!admin.email || !admin.password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const existing = await User.findOne({ email: admin.email.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists: ${admin.email}`);
    process.exit(0);
  }

  const created = await User.create({
    name: admin.name,
    email: admin.email,
    password: admin.password,
    role: 'admin',
    isActive: true,
  });

  console.log(`Admin created: ${created.email} (role: ${created.role})`);
  process.exit(0);
})().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});