const express = require('express');
const {
  listAgents,
  createAgent,
  deactivateAgent,
  activateAgent,
  getAgentDetails,
} = require('../controllers/agentController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// All agent routes require authentication
router.use(protect);

// GET — visible to all operational roles for agent-assignment dropdowns.
// delivery_agent is excluded: they have no need to browse the agent roster.
router.get(
  '/',
  requireRole(['admin', 'operations_manager', 'warehouse_operator']),
  listAgents
);

// GET single agent details — accessible by admin and operations_manager
router.get(
  '/:id',
  requireRole(['admin', 'operations_manager']),
  getAgentDetails
);

// Create — only admin and operations_manager can register new agents
router.post(
  '/',
  requireRole(['admin', 'operations_manager']),
  createAgent
);

// Activate / deactivate — admin only (lifecycle control)
router.patch('/:id/deactivate', requireRole(['admin']), deactivateAgent);
router.patch('/:id/activate',   requireRole(['admin']), activateAgent);

module.exports = router;
