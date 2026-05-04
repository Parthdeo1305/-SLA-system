const mongoose = require('mongoose');

/**
 * Agent Model
 * Manages delivery personnel and their current workload.
 */
const agentSchema = new mongoose.Schema(
  {
    agentId: {
      type: String,
      unique: true,
      required: [true, 'Internal Agent ID is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Agent name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Agent phone number is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'busy'],
      default: 'available',
      index: true,
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    /**
     * Optional link to a User account with role='delivery_agent'.
     * When set, that user can log in to the portal and see only their orders.
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent accidental deletion of busy agents
agentSchema.pre('save', function (next) {
  if (this.isModified('isActive') && !this.isActive && this.status === 'busy') {
    return next(new Error('Cannot deactivate an agent who is currently on an active delivery.'));
  }
  next();
});

module.exports = mongoose.model('Agent', agentSchema);
