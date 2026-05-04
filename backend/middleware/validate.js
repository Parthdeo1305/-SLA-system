const Joi = require('joi');

/**
 * Middleware factory: validates req.body against a Joi schema.
 * Returns 400 with field-level error messages on failure.
 *
 * @param {Joi.Schema} schema
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,   // Return ALL errors, not just the first
    stripUnknown: true,  // Strip fields not in schema (security)
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details,
    });
  }

  req.body = value; // Replace body with sanitised value
  next();
};

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*[0-9])/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter and one number',
      'any.required': 'Password is required',
    }),
  role: Joi.string()
    .valid('admin', 'operations_manager', 'warehouse_operator', 'delivery_agent')
    .default('warehouse_operator'),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// ─── Order Schemas ────────────────────────────────────────────────────────────

const createOrderSchema = Joi.object({
  customer: Joi.object({
    name: Joi.string().trim().min(2).max(150).required(),
    phone: Joi.string().trim().min(1).max(15).required(), // Relaxed for demo
    email: Joi.string().trim().email().optional().allow(''),
  }).required(),
  pickupAddress: Joi.object({
    addressLine: Joi.string().trim().min(1).required(), // Relaxed for demo
    city: Joi.string().trim().required(),
    pincode: Joi.string().trim().min(6).max(10).required(),
  }).required(),
  deliveryAddress: Joi.object({
    addressLine: Joi.string().trim().min(1).required(), // Relaxed for demo
    city: Joi.string().trim().required(),
    pincode: Joi.string().trim().min(6).max(10).required(),
  }).required(),
  promisedDeliveryTime: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'Promised delivery time must be in the future',
    'any.required': 'Promised delivery time is required',
  }),
  notes: Joi.string().trim().max(500).optional().allow(''),
});

const updateOrderSchema = Joi.object({
  status: Joi.string()
    .valid('Created', 'Picked', 'In Transit', 'Delivered', 'Failed')
    .required(),
  deliveryAgent: Joi.object({
    agent: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Must be a valid ObjectId
  }).optional(),
  location: Joi.string().trim().max(100).optional().allow(''),
  note: Joi.string().trim().max(500).optional().allow(''),
  delayReason: Joi.string()
    .valid('Traffic', 'Weather', 'Vehicle Issue', 'Warehouse Delay', 'Address Issue', 'Other')
    .optional()
    .allow(null, ''),
  delayNote: Joi.string().trim().max(500).optional().allow(''),
});

module.exports = {
  validate,
  schemas: {
    register: registerSchema,
    login: loginSchema,
    createOrder: createOrderSchema,
    updateOrder: updateOrderSchema,
  },
};
