const express = require('express');
const {
  getStats,
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
} = require('../controllers/orderController');
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { protect, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

// All order routes require authentication
router.use(protect);

// NOTE: /stats must be defined BEFORE /:id to avoid Express matching
// "stats" as an ObjectId parameter.
// Stats & analytics are restricted: delivery_agents only see their own orders
// via listOrders — they should not access aggregate stats.
router.get(
  '/stats',
  requireRole(['admin', 'operations_manager', 'warehouse_operator']),
  getStats
);
router.get(
  '/analytics',
  requireRole(['admin', 'operations_manager', 'warehouse_operator']),
  getDashboardAnalytics
);

// List orders — all roles allowed; delivery_agent is filtered in the controller
// Create order — not available to delivery_agent (they fulfil, not create)
router
  .route('/')
  .get(listOrders)
  .post(
    requireRole(['admin', 'operations_manager', 'warehouse_operator']),
    validate(schemas.createOrder),
    createOrder
  );

// Get single order — all roles allowed; controller enforces delivery_agent scope
// Update order — all roles allowed; controller enforces per-role restrictions
router
  .route('/:id')
  .get(getOrder)
  .patch(validate(schemas.updateOrder), updateOrder);

module.exports = router;
