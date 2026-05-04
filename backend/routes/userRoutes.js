const express = require('express');
const {
  listUsers,
  deactivateUser,
  activateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// All user management routes require admin role
router.use(protect);
router.use(requireRole(['admin']));

router.get('/', listUsers);

router.patch('/:id/deactivate', deactivateUser);
router.patch('/:id/activate', activateUser);

router.delete('/:id', deleteUser);

module.exports = router;
