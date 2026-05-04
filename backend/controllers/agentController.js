const Agent = require('../models/Agent');
const { Order } = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── GET /api/agents ──────────────────────────────────────────────────────────
const listAgents = asyncHandler(async (req, res) => {
  const { status, isActive } = req.query;
  const filter = {};
  
  if (status) filter.status = status;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const agents = await Agent.find(filter).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: agents.length,
    agents,
  });
});

// ─── POST /api/agents ─────────────────────────────────────────────────────────
const createAgent = asyncHandler(async (req, res) => {
  const { agentId, name, phone } = req.body;

  const agent = await Agent.create({
    agentId,
    name,
    phone,
  });

  res.status(201).json({ success: true, agent });
});

// ─── PATCH /api/agents/:id/deactivate ────────────────────────────────────────
const deactivateAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }

  agent.isActive = false;
  await agent.save();

  res.status(200).json({ success: true, agent });
});

// ─── PATCH /api/agents/:id/activate ──────────────────────────────────────────
const activateAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }

  agent.isActive = true;
  await agent.save();

  res.status(200).json({ success: true, agent });
});

// ─── GET /api/agents/:id ──────────────────────────────────────────────────────
const getAgentDetails = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id).populate('currentOrderId');
  if (!agent) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }

  // Fetch past 10 orders assigned to this agent
  const pastOrders = await Order.find({
    'deliveryAgent.agent': agent._id,
    status: { $in: ['Delivered', 'Failed'] }
  })
    .sort({ updatedAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    agent,
    currentOrder: agent.currentOrderId,
    pastOrders,
  });
});

module.exports = {
  listAgents,
  createAgent,
  deactivateAgent,
  activateAgent,
  getAgentDetails,
};
