/**
 * Seed Script — Populates the database with realistic Indian sample data.
 *
 * Usage: npm run seed
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { Order } = require('../models/Order');
const Agent = require('../models/Agent');

const connectDB = require('../config/db');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hoursFromNow = (h) => new Date(Date.now() + h * 60 * 60 * 1000);
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

// ─── Sample Users ─────────────────────────────────────────────────────────────

const sampleUsers = [
  {
    name: 'Vikram Malhotra',
    email: 'operations@shiptrack.in',
    passwordHash: 'admin123',
    role: 'operations_manager',
  },
  {
    name: 'Sanjay Gupta',
    email: 'warehouse@shiptrack.in',
    passwordHash: 'admin123',
    role: 'warehouse_operator',
  },
  {
    name: 'Admin',
    email: 'admin@shiptrack.com',
    passwordHash: 'admin123',
    role: 'admin',
  },
];

// ─── Sample Fleet (Agents) ────────────────────────────────────────────────────

const sampleAgents = [
  { agentId: 'AGT-001', name: 'Ramesh Singh', phone: '+91 9876543210', status: 'available' },
  { agentId: 'AGT-002', name: 'Amit Kumar', phone: '+91 9876543211', status: 'busy' },
  { agentId: 'AGT-003', name: 'Suresh Yadav', phone: '+91 9876543212', status: 'busy' },
  { agentId: 'AGT-004', name: 'Raju Bhai', phone: '+91 9876543213', status: 'busy' },
  { agentId: 'AGT-005', name: 'Dinesh Patil', phone: '+91 9876543214', status: 'available' },
];

// ─── Sample Orders ────────────────────────────────────────────────────────────

const buildOrders = (userId, agents) => [
  // ── Delivered (on time) ───────────────────────────────────────────────────
  {
    customer: { name: 'Rajesh Sharma', phone: '+91 9822012345', email: 'rajesh.sharma@example.in' },
    pickupAddress: { addressLine: 'Warehouse A, MIDC', city: 'Pune', pincode: '411057' },
    deliveryAddress: { addressLine: '101, Shivam Apts, Kothrud', city: 'Pune', pincode: '411038' },
    status: 'Delivered',
    promisedDeliveryTime: hoursAgo(2),
    notes: 'Standard delivery. Signed by security guard.',
    createdBy: userId,
    createdAt: daysAgo(3),
    deliveryAgent: { agent: agents[0]._id, name: agents[0].name, phone: agents[0].phone },
  },
  {
    customer: { name: 'Priya Patel', phone: '+91 9933098765', email: 'priya.patel@example.in' },
    pickupAddress: { addressLine: 'Warehouse B, Andheri East', city: 'Mumbai', pincode: '400069' },
    deliveryAddress: { addressLine: 'Sea View Towers, Worli', city: 'Mumbai', pincode: '400018' },
    status: 'Delivered',
    promisedDeliveryTime: hoursAgo(5),
    notes: 'Priority shipment — delivered ahead of schedule.',
    createdBy: userId,
    createdAt: daysAgo(5),
    deliveryAgent: { agent: agents[1]._id, name: agents[1].name, phone: agents[1].phone },
  },
  {
    customer: { name: 'Anil Gupta', phone: '+91 9811223344', email: 'agupta@retailindia.com' },
    pickupAddress: { addressLine: 'Delhi Hub, Okhla Phase 1', city: 'New Delhi', pincode: '110020' },
    deliveryAddress: { addressLine: 'Connaught Place Block C', city: 'New Delhi', pincode: '110001' },
    status: 'Delivered',
    promisedDeliveryTime: daysAgo(1),
    notes: 'Fragile electronics. Delivered intact.',
    createdBy: userId,
    createdAt: daysAgo(4),
    deliveryAgent: { agent: agents[2]._id, name: agents[2].name, phone: agents[2].phone },
  },

  // ── In Transit — on time ──────────────────────────────────────────────────
  {
    customer: { name: 'Sunita Verma', phone: '+91 9988776655', email: 's.verma@pharmaco.in' },
    pickupAddress: { addressLine: 'Cold Storage Unit, Electronic City', city: 'Bengaluru', pincode: '560100' },
    deliveryAddress: { addressLine: 'Apollo Clinic, Koramangala', city: 'Bengaluru', pincode: '560034' },
    status: 'In Transit',
    promisedDeliveryTime: hoursFromNow(4),
    notes: 'Temperature-sensitive cargo. Refrigerated truck required.',
    createdBy: userId,
    createdAt: hoursAgo(6),
    deliveryAgent: { agent: agents[3]._id, name: agents[3].name, phone: agents[3].phone },
  },
  {
    customer: { name: 'Vikash Jain', phone: '+91 9123456780', email: 'vikash.jain@example.in' },
    pickupAddress: { addressLine: 'Textile Hub, Surat', city: 'Surat', pincode: '395002' },
    deliveryAddress: { addressLine: 'Wholesale Market, Ring Road', city: 'Surat', pincode: '395003' },
    status: 'In Transit',
    promisedDeliveryTime: hoursFromNow(8),
    createdBy: userId,
    createdAt: hoursAgo(3),
    deliveryAgent: { agent: agents[1]._id, name: agents[1].name, phone: agents[1].phone },
  },

  // ── In Transit — DUE SOON (within 60 min = warning) ──────────────────────
  {
    customer: { name: 'Manoj Tiwari', phone: '+91 9876123450', email: 'manoj.constructions@example.in' },
    pickupAddress: { addressLine: 'Cement Godown, Navi Mumbai', city: 'Navi Mumbai', pincode: '400705' },
    deliveryAddress: { addressLine: 'Site C, Vashi Sector 17', city: 'Navi Mumbai', pincode: '400703' },
    status: 'In Transit',
    promisedDeliveryTime: hoursFromNow(0.5),
    notes: 'Construction materials — site access only 9am–5pm.',
    createdBy: userId,
    createdAt: hoursAgo(12),
    deliveryAgent: { agent: agents[2]._id, name: agents[2].name, phone: agents[2].phone },
  },

  // ── In Transit — DELAYED ──────────────────────────────────────────────────
  {
    customer: { name: 'Ritu Desai', phone: '+91 9000011111', email: 'ritu.boutique@example.in' },
    pickupAddress: { addressLine: 'Garment Factory, Tiruppur', city: 'Tiruppur', pincode: '641602' },
    deliveryAddress: { addressLine: 'Retail Mall, Anna Nagar', city: 'Chennai', pincode: '600040' },
    status: 'In Transit',
    promisedDeliveryTime: hoursAgo(3),
    notes: 'Delayed due to heavy traffic on NH48.',
    createdBy: userId,
    createdAt: daysAgo(2),
    deliveryAgent: { agent: agents[3]._id, name: agents[3].name, phone: agents[3].phone },
    delayReason: 'Traffic',
    delayNote: 'Caught in a massive jam near the toll plaza.',
  },
  {
    customer: { name: 'Karan Singh', phone: '+91 9888822222', email: 'karan.singh@auto.in' },
    pickupAddress: { addressLine: 'Auto Parts Mfg, Manesar', city: 'Gurugram', pincode: '122051' },
    deliveryAddress: { addressLine: 'Service Center, Sector 14', city: 'Gurugram', pincode: '122001' },
    status: 'In Transit',
    promisedDeliveryTime: hoursAgo(6),
    notes: 'Driver reported vehicle breakdown. Replacement arranged.',
    createdBy: userId,
    createdAt: daysAgo(3),
    deliveryAgent: { agent: agents[1]._id, name: agents[1].name, phone: agents[1].phone },
    delayReason: 'Vehicle Issue',
    delayNote: 'Flat tire on the delivery tempo.',
  },

  // ── Picked — DELAYED ─────────────────────────────────────────────────────
  {
    customer: { name: 'Neha Agarwal', phone: '+91 9777733333', email: 'neha.a@example.in' },
    pickupAddress: { addressLine: 'Warehouse C, Bhiwandi', city: 'Thane', pincode: '421302' },
    deliveryAddress: { addressLine: 'Godrej Woods, Vikhroli', city: 'Mumbai', pincode: '400079' },
    status: 'Picked',
    promisedDeliveryTime: hoursAgo(4),
    notes: 'High priority order. Escalate immediately.',
    createdBy: userId,
    createdAt: daysAgo(2),
    delayReason: 'Warehouse Delay',
    delayNote: 'Stock was hard to locate in the aisles.',
  },

  // ── Created — on time ────────────────────────────────────────────────────
  {
    customer: { name: 'Rahul Joshi', phone: '+91 9666644444', email: 'rahul.j@example.in' },
    pickupAddress: { addressLine: 'Main Depot, Whitefield', city: 'Bengaluru', pincode: '560066' },
    deliveryAddress: { addressLine: 'IT Park, Bellandur', city: 'Bengaluru', pincode: '560103' },
    status: 'Created',
    promisedDeliveryTime: hoursFromNow(24),
    createdBy: userId,
    createdAt: hoursAgo(0.5),
  },

  // ── Failed ───────────────────────────────────────────────────────────────
  {
    customer: { name: 'Arjun Reddy', phone: '+91 9555555555', email: 'arjun.r@example.in' },
    pickupAddress: { addressLine: 'Hub 1, HITEC City', city: 'Hyderabad', pincode: '500081' },
    deliveryAddress: { addressLine: 'Gachibowli Phase 2', city: 'Hyderabad', pincode: '500032' },
    status: 'Failed',
    promisedDeliveryTime: daysAgo(1),
    notes: 'Recipient refused delivery. Return to sender initiated.',
    createdBy: userId,
    createdAt: daysAgo(3),
    deliveryAgent: { agent: agents[4]._id, name: agents[4].name, phone: agents[4].phone },
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

const seed = async () => {
  await connectDB();

  console.log('\n[Seed] Clearing existing data...');
  await Promise.all([User.deleteMany({}), Order.deleteMany({}), Agent.deleteMany({})]);
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

  console.log('[Seed] Creating fleet agents...');
  const createdAgents = await Agent.insertMany(sampleAgents);
  console.log(`[Seed] Created ${createdAgents.length} agents`);

  console.log('[Seed] Creating orders...');
  const orderData = buildOrders(manager._id, createdAgents);

  for (const data of orderData) {
    await new Order(data).save();
  }

  console.log(`[Seed] Created ${orderData.length} orders`);

  console.log('\n✅ Seed complete!\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('[Seed] Failed:', err.message);
  process.exit(1);
});
