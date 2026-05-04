const mongoose = require('mongoose');
const { computeSLAStatus } = require('../services/slaService');

// ─── Status flow ────────────────────────────────────────────────────────────
// Created → Picked → In Transit → Delivered
//                              └→ Failed
const STATUSES = ['Created', 'Picked', 'In Transit', 'Delivered', 'Failed'];

// Valid next-status transitions to enforce one-directional flow
const STATUS_TRANSITIONS = {
  Created: ['Picked'],
  Picked: ['In Transit'],
  'In Transit': ['Delivered', 'Failed'],
  Delivered: [],
  Failed: [],
};

// ─── Counter helper for Order ID generation ─────────────────────────────────
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model('Counter', counterSchema);

// ─── Order Schema ────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      index: true,
    },
    customer: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
    },
    pickupAddress: {
      addressLine: { type: String },
      city: { type: String },
      pincode: { type: String },
    },
    deliveryAddress: {
      addressLine: { type: String },
      city: { type: String },
      pincode: { type: String },
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Created',
      index: true,
    },
    promisedDeliveryTime: {
      type: Date,
      required: [true, 'Promised delivery time is required'],
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveryAgent: {
      agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
      name: { type: String },
      phone: { type: String },
    },
    assignedAt: {
      type: Date,
    },
    transitLogs: [
      {
        status: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: String }, // User ID or Agent ID
        location: { type: String },
        note: { type: String },
      },
    ],
    delayReason: {
      type: String,
      enum: [
        'Traffic',
        'Weather',
        'Vehicle Issue',
        'Warehouse Delay',
        'Address Issue',
        'Other',
        null,
      ],
      default: null,
    },
    delayNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Compound index for the "delayed" query (status + deadline) ──────────────
orderSchema.index({ status: 1, promisedDeliveryTime: 1 });

// ─── Virtual: SLA computed fields ───────────────────────────────────────────
orderSchema.virtual('sla').get(function () {
  return computeSLAStatus(this);
});

orderSchema.virtual('isDelayed').get(function () {
  return this.sla.isDelayed;
});

orderSchema.virtual('delayDuration').get(function () {
  return this.sla.delayDuration;
});

orderSchema.virtual('timeUntilDue').get(function () {
  return this.sla.timeUntilDue;
});

// ─── Auto-generate Order ID before first save ────────────────────────────────
orderSchema.pre('save', async function (next) {
  if (this.orderId) return next(); // Already assigned

  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');

  const counterId = `order_${dateStr}`;
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  this.orderId = `STS-${dateStr}-${String(counter.seq).padStart(4, '0')}`;
  next();
});

// ─── Static: validate status transition ─────────────────────────────────────
orderSchema.statics.isValidTransition = function (from, to) {
  const allowed = STATUS_TRANSITIONS[from] || [];
  return allowed.includes(to);
};

// ─── Export ──────────────────────────────────────────────────────────────────
module.exports = {
  Order: mongoose.model('Order', orderSchema),
  STATUSES,
  STATUS_TRANSITIONS,
};
