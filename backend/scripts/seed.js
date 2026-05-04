/**
 * Seed Script — Populates the database with realistic sample data.
 *
 * Usage: npm run seed
 *
 * Creates:
 *  - 3 users (one per role)
 *  - 20 orders spanning all statuses, with deliberate SLA breaches
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { Order } = require('../models/Order');

const connectDB = require('../config/db');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hoursFromNow = (h) => new Date(Date.now() + h * 60 * 60 * 1000);
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

// ─── Sample Users ─────────────────────────────────────────────────────────────

const sampleUsers = [
  {
    name: 'Sarah Chen',
    email: 'sarah@logisticsco.com',
    passwordHash: 'Password123!',
    role: 'operations_manager',
  },
  {
    name: 'Raj Patel',
    email: 'raj@logisticsco.com',
    passwordHash: 'Password123!',
    role: 'warehouse_staff',
  },
  {
    name: 'Alex Morgan',
    email: 'alex@logisticsco.com',
    passwordHash: 'Password123!',
    role: 'admin',
  },
];

// ─── Sample Orders ────────────────────────────────────────────────────────────

const buildOrders = (userId) => [
  // ── Delivered (on time) ───────────────────────────────────────────────────
  {
    customerName: 'Acme Corporation',
    status: 'Delivered',
    promisedDeliveryTime: hoursAgo(2),
    notes: 'Standard delivery. Signed by receptionist.',
    createdBy: userId,
    createdAt: daysAgo(3),
  },
  {
    customerName: 'Global Imports Ltd',
    status: 'Delivered',
    promisedDeliveryTime: hoursAgo(5),
    notes: 'Priority shipment — delivered ahead of schedule.',
    createdBy: userId,
    createdAt: daysAgo(5),
  },
  {
    customerName: 'Sunrise Foods',
    status: 'Delivered',
    promisedDeliveryTime: hoursAgo(1),
    createdBy: userId,
    createdAt: daysAgo(2),
  },
  {
    customerName: 'Metro Electronics',
    status: 'Delivered',
    promisedDeliveryTime: daysAgo(1),
    notes: 'Contains fragile goods. Delivered intact.',
    createdBy: userId,
    createdAt: daysAgo(4),
  },

  // ── In Transit — on time ──────────────────────────────────────────────────
  {
    customerName: 'Pinnacle Pharma',
    status: 'In Transit',
    promisedDeliveryTime: hoursFromNow(4),
    notes: 'Temperature-sensitive cargo. Refrigerated truck.',
    createdBy: userId,
    createdAt: hoursAgo(6),
  },
  {
    customerName: 'BlueSky Retail',
    status: 'In Transit',
    promisedDeliveryTime: hoursFromNow(8),
    createdBy: userId,
    createdAt: hoursAgo(3),
  },
  {
    customerName: 'Quantum Devices',
    status: 'In Transit',
    promisedDeliveryTime: hoursFromNow(2),
    notes: 'High-value electronics — requires signature.',
    createdBy: userId,
    createdAt: hoursAgo(10),
  },

  // ── In Transit — DUE SOON (within 60 min = warning) ──────────────────────
  {
    customerName: 'NovaBuild Supplies',
    status: 'In Transit',
    promisedDeliveryTime: hoursFromNow(0.5),
    notes: 'Construction materials — site access only 9am–5pm.',
    createdBy: userId,
    createdAt: hoursAgo(12),
  },

  // ── In Transit — DELAYED ──────────────────────────────────────────────────
  {
    customerName: 'Horizon Textiles',
    status: 'In Transit',
    promisedDeliveryTime: hoursAgo(3),
    notes: 'Delayed due to traffic on the M6 motorway.',
    createdBy: userId,
    createdAt: daysAgo(2),
  },
  {
    customerName: 'Atlas Chemicals',
    status: 'In Transit',
    promisedDeliveryTime: hoursAgo(6),
    notes: 'Driver reported vehicle breakdown. Replacement arranged.',
    createdBy: userId,
    createdAt: daysAgo(3),
  },
  {
    customerName: 'Sterling Auto Parts',
    status: 'In Transit',
    promisedDeliveryTime: hoursAgo(10),
    notes: 'Custom clearance hold at port of entry.',
    createdBy: userId,
    createdAt: daysAgo(4),
  },

  // ── Picked — DELAYED ─────────────────────────────────────────────────────
  {
    customerName: 'Vega Medical',
    status: 'Picked',
    promisedDeliveryTime: hoursAgo(4),
    notes: 'Medical supplies — high priority. Escalate immediately.',
    createdBy: userId,
    createdAt: daysAgo(2),
  },
  {
    customerName: 'Fusion Beverages',
    status: 'Picked',
    promisedDeliveryTime: hoursAgo(1),
    createdBy: userId,
    createdAt: hoursAgo(8),
  },

  // ── Picked — on time ─────────────────────────────────────────────────────
  {
    customerName: 'Arctic Cold Chain',
    status: 'Picked',
    promisedDeliveryTime: hoursFromNow(6),
    notes: 'Frozen goods. Handle with cold storage.',
    createdBy: userId,
    createdAt: hoursAgo(1),
  },

  // ── Created — on time ────────────────────────────────────────────────────
  {
    customerName: 'Evergreen Logistics',
    status: 'Created',
    promisedDeliveryTime: hoursFromNow(24),
    createdBy: userId,
    createdAt: hoursAgo(0.5),
  },
  {
    customerName: 'Titan Infrastructure',
    status: 'Created',
    promisedDeliveryTime: hoursFromNow(48),
    notes: 'Oversized load — special permit required.',
    createdBy: userId,
    createdAt: hoursAgo(0.25),
  },

  // ── Created — DELAYED (sat in Created too long) ───────────────────────────
  {
    customerName: 'Omega Print Solutions',
    status: 'Created',
    promisedDeliveryTime: hoursAgo(2),
    notes: 'Awaiting pickup confirmation from warehouse.',
    createdBy: userId,
    createdAt: daysAgo(2),
  },

  // ── Failed ───────────────────────────────────────────────────────────────
  {
    customerName: 'Cascade Building Co',
    status: 'Failed',
    promisedDeliveryTime: daysAgo(1),
    notes: 'Recipient refused delivery. Return to sender initiated.',
    createdBy: userId,
    createdAt: daysAgo(3),
  },
  {
    customerName: 'Redline Retail',
    status: 'Failed',
    promisedDeliveryTime: daysAgo(2),
    notes: 'Address not found. Customer to provide updated address.',
    createdBy: userId,
    createdAt: daysAgo(5),
  },
  {
    customerName: 'Pacific Trade Co',
    status: 'Failed',
    promisedDeliveryTime: hoursAgo(48),
    notes: 'Shipment damaged in transit. Insurance claim filed.',
    createdBy: userId,
    createdAt: daysAgo(7),
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

const seed = async () => {
  await connectDB();

  console.log('\n[Seed] Clearing existing data...');
  await Promise.all([User.deleteMany({}), Order.deleteMany({})]);
  await mongoose.connection.collection('counters').deleteMany({});

  console.log('[Seed] Creating users...');
  const createdUsers = await User.insertMany(
    await Promise.all(
      sampleUsers.map(async (u) => ({
        ...u,
        passwordHash: await bcrypt.hash(u.passwordHash, 12),
      }))
    )
  );

  const manager = createdUsers.find((u) => u.role === 'operations_manager');
  console.log(`[Seed] Created ${createdUsers.length} users`);

  console.log('[Seed] Creating orders...');
  const orderData = buildOrders(manager._id);

  // Insert one by one to trigger the orderId pre-save hook
  for (const data of orderData) {
    await new Order(data).save();
  }

  console.log(`[Seed] Created ${orderData.length} orders`);

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('Test Credentials:');
  console.log('  Operations Manager: sarah@logisticsco.com / Password123!');
  console.log('  Warehouse Staff:    raj@logisticsco.com   / Password123!');
  console.log('  Admin:              alex@logisticsco.com  / Password123!');
  console.log('─────────────────────────────────────────\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('[Seed] Failed:', err.message);
  process.exit(1);
});
