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

// ─── Data Generators ─────────────────────────────────────────────────────────

const firstNames = ['Amit', 'Raj', 'Suresh', 'Rahul', 'Vikram', 'Dinesh', 'Ramesh', 'Raju', 'Karan', 'Arjun', 'Manish', 'Sanjay', 'Prakash', 'Anil', 'Sunil', 'Vijay', 'Ashok', 'Ravi', 'Mukesh', 'Gaurav', 'Neha', 'Priya', 'Sunita', 'Ritu'];
const lastNames = ['Kumar', 'Singh', 'Sharma', 'Patel', 'Yadav', 'Gupta', 'Jain', 'Verma', 'Tiwari', 'Desai', 'Reddy', 'Agarwal', 'Malhotra', 'Joshi', 'Chauhan'];

const generateAgents = (count) => {
  const agents = [];
  for (let i = 0; i < count; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    agents.push({
      agentId: `AGT-${String(i + 1).padStart(3, '0')}`,
      name: `${fn} ${ln}`,
      phone: `+91 9${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: Math.random() > 0.5 ? 'available' : 'busy',
      isActive: true
    });
  }
  return agents;
};

const sampleAgents = generateAgents(25);

const cities = [
  { c: 'Mumbai', p: '400001' },
  { c: 'Delhi', p: '110001' },
  { c: 'Bengaluru', p: '560001' },
  { c: 'Hyderabad', p: '500001' },
  { c: 'Pune', p: '411001' },
  { c: 'Chennai', p: '600001' },
  { c: 'Kolkata', p: '700001' },
  { c: 'Ahmedabad', p: '380001' }
];

const statuses = ['Created', 'Picked', 'In Transit', 'In Transit', 'In Transit', 'Delivered', 'Delivered', 'Failed'];
const delayReasons = ['Traffic', 'Vehicle Issue', 'Warehouse Delay', 'Weather', 'Address Issue'];

const buildOrders = (userId, agents) => {
  const orders = [];
  for (let i = 0; i < 70; i++) {
    const cityObj = cities[Math.floor(Math.random() * cities.length)];
    const isDelayed = Math.random() < 0.25; // 25% delayed
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    let promisedTime;
    if (isDelayed && status !== 'Delivered') {
      promisedTime = hoursAgo(Math.floor(Math.random() * 24) + 1);
    } else {
      promisedTime = hoursFromNow(Math.floor(Math.random() * 48) + 1);
    }
    
    let deliveryAgent;
    if (status !== 'Created' && agents.length > 0) {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      deliveryAgent = { agent: agent._id, name: agent.name, phone: agent.phone };
    }
    
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const reason = delayReasons[Math.floor(Math.random() * delayReasons.length)];
    
    orders.push({
      customer: { 
        name: `${fn} ${ln}`, 
        phone: `+91 9${Math.floor(10000000 + Math.random() * 90000000)}`, 
        email: `${fn.toLowerCase()}${i}@example.in` 
      },
      pickupAddress: { addressLine: `Fulfillment Center ${Math.floor(Math.random() * 5) + 1}`, city: cityObj.c, pincode: cityObj.p },
      deliveryAddress: { addressLine: `Sector ${Math.floor(Math.random() * 20) + 1}, Block ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`, city: cityObj.c, pincode: cityObj.p },
      status,
      promisedDeliveryTime: promisedTime,
      createdBy: userId,
      createdAt: daysAgo(Math.floor(Math.random() * 5) + 1),
      deliveryAgent,
      delayReason: isDelayed ? reason : undefined,
      delayNote: isDelayed ? `Reported delay due to ${reason.toLowerCase()}` : undefined,
    });
  }
  return orders;
};

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
