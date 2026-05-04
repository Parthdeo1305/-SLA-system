const { Order, STATUS_TRANSITIONS } = require('../models/Order');
const Agent = require('../models/Agent');
const { computeSLAStatus } = require('../services/slaService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Serialize an order document into a clean API response shape.
 * Computes SLA fields fresh on every serialization.
 */
const serializeOrder = (order) => {
  const sla = computeSLAStatus(order);
  return {
    id: order._id,
    orderId: order.orderId,
    customer: order.customer,
    pickupAddress: order.pickupAddress,
    deliveryAddress: order.deliveryAddress,
    status: order.status,
    promisedDeliveryTime: order.promisedDeliveryTime,
    notes: order.notes,
    createdBy: order.createdBy,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    isDelayed: sla.isDelayed,
    delayDuration: sla.delayDuration,
    timeUntilDue: sla.timeUntilDue,
    deliveryAgent: order.deliveryAgent,
    assignedAt: order.assignedAt,
    transitLogs: order.transitLogs,
    delayReason: order.delayReason,
    delayNote: order.delayNote,
  };
};

// ─── GET /api/orders/stats ────────────────────────────────────────────────────
const getStats = asyncHandler(async (req, res) => {
  const now = new Date();

  // Use MongoDB aggregation for efficient counts
  const [statusCounts, delayedCount] = await Promise.all([
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    // Delayed = past deadline AND not in terminal status
    Order.countDocuments({
      status: { $nin: ['Delivered', 'Failed'] },
      promisedDeliveryTime: { $lt: now },
    }),
  ]);

  const counts = statusCounts.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    stats: {
      total: await Order.countDocuments(),
      delivered: counts['Delivered'] || 0,
      inTransit: counts['In Transit'] || 0,
      picked: counts['Picked'] || 0,
      created: counts['Created'] || 0,
      failed: counts['Failed'] || 0,
      delayed: delayedCount,
    },
  });
});

// ─── GET /api/orders ──────────────────────────────────────────────────────────
const listOrders = asyncHandler(async (req, res) => {
  const now = new Date();
  const { status, delayed, page = 1, limit = 20, search } = req.query;

  // Build base filter query
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (delayed === 'true') {
    filter.status = { $nin: ['Delivered', 'Failed'] };
    filter.promisedDeliveryTime = { $lt: now };
  }
  if (search) {
    filter.$or = [
      { 'customer.name': { $regex: search, $options: 'i' } },
      { orderId: { $regex: search, $options: 'i' } },
    ];
  }

  // ── RBAC: delivery_agent sees only their assigned orders ────────────────
  if (req.user.role === 'delivery_agent') {
    if (!req.user.agentRef) {
      // Agent user not linked to an Agent record yet — return empty list
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        page: 1,
        totalPages: 0,
        orders: [],
      });
    }
    filter['deliveryAgent.agent'] = req.user.agentRef;
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email'),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    orders: orders.map(serializeOrder),
  });
});

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'createdBy',
    'name email'
  );

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  // ── RBAC: delivery_agent can only view their own assigned order ─────────
  if (req.user.role === 'delivery_agent') {
    const agentRef = req.user.agentRef?.toString();
    const orderAgent = order.deliveryAgent?.agent?.toString();
    if (!agentRef || agentRef !== orderAgent) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. This order is not assigned to you.',
      });
    }
  }

  res.status(200).json({ success: true, order: serializeOrder(order) });
});

// ─── POST /api/orders ─────────────────────────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const { customer, pickupAddress, deliveryAddress, promisedDeliveryTime, notes } = req.body;

  const order = await Order.create({
    customer,
    pickupAddress,
    deliveryAddress,
    promisedDeliveryTime,
    notes,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, order: serializeOrder(order) });
});

// ─── PATCH /api/orders/:id ────────────────────────────────────────────────────
const updateOrder = asyncHandler(async (req, res) => {
  let { status, note, location, deliveryAgent, delayReason, delayNote } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  const role = req.user.role;

  // ── RBAC: delivery_agent may only update their assigned order ──────────
  if (role === 'delivery_agent') {
    const agentRef = req.user.agentRef?.toString();
    const orderAgent = order.deliveryAgent?.agent?.toString();

    if (!agentRef || agentRef !== orderAgent) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update orders assigned to you.',
      });
    }

    // Strip agent-assignment payload — delivery_agents cannot re-assign
    deliveryAgent = undefined;
  }

  // ── RBAC: warehouse_operator cannot assign delivery agents ─────────────
  if (role === 'warehouse_operator') {
    deliveryAgent = undefined;
  }

  // ── Only admin / operations_manager can assign agents ──────────────────
  const canAssignAgent = ['admin', 'operations_manager'].includes(role);

  // Handle Status Transition & Agent Lifecycle
  if (status && status !== order.status) {
    const isValid = Order.isValidTransition(order.status, status);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from '${order.status}' to '${status}'.`,
      });
    }

    // ── AGENT ASSIGNMENT LOGIC (When status moves to 'Picked') ──────
    if (status === 'Picked') {
      if (!canAssignAgent) {
        return res.status(403).json({
          success: false,
          error: 'Only admin or operations_manager can assign a delivery agent.',
        });
      }
      if (!deliveryAgent || !deliveryAgent.agent) {
        return res.status(400).json({ success: false, error: 'Agent assignment required for Picked status.' });
      }

      const agent = await Agent.findOne({ _id: deliveryAgent.agent, isActive: true });
      if (!agent) {
        return res.status(404).json({ success: false, error: 'Selected agent not found or inactive.' });
      }

      if (agent.status === 'busy' && agent.currentOrderId?.toString() !== order._id.toString()) {
        return res.status(400).json({ success: false, error: `Agent ${agent.name} is currently busy with another order.` });
      }

      // Lock Agent
      agent.status = 'busy';
      agent.currentOrderId = order._id;
      await agent.save();

      // Denormalize into Order for fast reading
      order.deliveryAgent = {
        agent: agent._id,
        name: agent.name,
        phone: agent.phone
      };
      order.assignedAt = new Date();
    }

    // ── AGENT RELEASE LOGIC (When status moves to terminal) ──────
    if (['Delivered', 'Failed'].includes(status)) {
      if (order.deliveryAgent && order.deliveryAgent.agent) {
        const agent = await Agent.findById(order.deliveryAgent.agent);
        if (agent) {
          agent.status = 'available';
          agent.currentOrderId = null;
          await agent.save();
        }
      }
    }

    order.status = status;
    order.transitLogs.push({
      status,
      updatedAt: new Date(),
      updatedBy: req.user._id.toString(),
      location: location || undefined,
      note: note || undefined,
    });
  }

  // Update delay fields if provided
  if (delayReason !== undefined) order.delayReason = delayReason;
  if (delayNote !== undefined) order.delayNote = delayNote;

  await order.save();

  res.status(200).json({ success: true, order: serializeOrder(order) });
});

module.exports = { getStats, listOrders, getOrder, createOrder, updateOrder };
