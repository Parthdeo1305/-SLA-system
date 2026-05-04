const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── GET /api/users ──────────────────────────────────────────────────────────
const listUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

// ─── PATCH /api/users/:id/deactivate ──────────────────────────────────────────
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  // Business Rule: Admin cannot deactivate themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      error: 'You cannot deactivate your own account.',
    });
  }

  // Business Rule: Cannot deactivate the last active admin
  if (user.role === 'admin') {
    const activeAdmins = await User.countDocuments({
      role: 'admin',
      isActive: true,
    });
    if (activeAdmins <= 1) {
      return res.status(400).json({
        success: false,
        error: 'Cannot deactivate the last active administrator.',
      });
    }
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.email} has been deactivated.`,
    user,
  });
});

// ─── PATCH /api/users/:id/activate ────────────────────────────────────────────
const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  user.isActive = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.email} has been activated.`,
    user,
  });
});

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, error: 'You cannot delete yourself.' });
  }

  // Business Rule: Cannot delete the last active admin
  if (user.role === 'admin') {
    const activeAdmins = await User.countDocuments({
      role: 'admin',
      isActive: true,
    });
    if (activeAdmins <= 1) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the last active administrator.',
      });
    }
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User has been permanently deleted.',
  });
});

module.exports = { listUsers, deactivateUser, activateUser, deleteUser };
