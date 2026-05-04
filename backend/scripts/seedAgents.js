require('dotenv').config();
const mongoose = require('mongoose');
const Agent = require('../models/Agent');

const agents = [
  { agentId: 'AG-001', name: 'Vikram Singh', phone: '+91 98221 00101' },
  { agentId: 'AG-002', name: 'Arjun Mehta', phone: '+91 98221 00102' },
  { agentId: 'AG-003', name: 'Priya Sharma', phone: '+91 98221 00103' },
  { agentId: 'AG-004', name: 'Suresh Kumar', phone: '+91 98221 00104' },
];

async function seedAgents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing agents to avoid duplicates in this demo script
    await Agent.deleteMany({});
    console.log('Cleared existing agents.');

    await Agent.insertMany(agents);
    console.log('Successfully seeded 4 agents.');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedAgents();
