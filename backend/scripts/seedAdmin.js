/**
 * Seed Admin Script — Securely creates an initial admin user from env vars.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=StrongPassword123! npm run seed:admin
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('\n❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
    process.exit(1);
  }

  console.log(`\n[SeedAdmin] Checking for admin: ${email}...`);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('[SeedAdmin] Admin user already exists. Updating details...');
    existing.name = 'System Admin';
    existing.role = 'admin';
    existing.passwordHash = password; // Will be hashed by pre-save hook
    existing.isActive = true;
    await existing.save();
    console.log('✅ Admin updated successfully.');
  } else {
    console.log('[SeedAdmin] Creating new admin user...');
    await User.create({
      name: 'System Admin',
      email,
      passwordHash: password,
      role: 'admin',
      isActive: true,
    });
    console.log('✅ Admin created successfully.');
  }

  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('[SeedAdmin] Failed:', err.message);
  process.exit(1);
});
