const { Order } = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/orders/analytics
 * Provides deep insights for the decision-driven dashboard.
 */
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  console.log('[Analytics] Starting computation...');
  const now = new Date();

  try {
    const [
      criticalShipments,
      delayBreakdown,
      agentPerformance,
      locationInsights,
      recentAlerts
    ] = await Promise.all([
      // 1. Critical Shipments
      Order.find({
        status: { $nin: ['Delivered', 'Failed'] },
        promisedDeliveryTime: { $lt: now }
      })
      .sort({ promisedDeliveryTime: 1 })
      .limit(5)
      .lean(),

      // 2. Delay Reason Breakdown
      Order.aggregate([
        { $match: { delayReason: { $exists: true, $ne: null, $ne: 'None' } } },
        { $project: { delayReason: { $cond: [{ $eq: ['$delayReason', ''] }, 'Unspecified', '$delayReason'] } } },
        { $group: { _id: '$delayReason', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // 3. Agent Performance
      Order.aggregate([
        { $match: { 'deliveryAgent.agentId': { $exists: true, $ne: null } } },
        { $group: {
            _id: '$deliveryAgent.agentId',
            name: { $first: '$deliveryAgent.name' },
            total: { $sum: 1 },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
            delayed: { $sum: { $cond: [
              { $or: [
                { $and: [
                  { $lt: ['$promisedDeliveryTime', now] },
                  { $not: { $in: ['$status', ['Delivered', 'Failed']] } }
                ]},
                { $and: [
                  { $ne: ['$delayReason', null] },
                  { $ne: ['$delayReason', 'None'] },
                  { $ne: ['$delayReason', ''] }
                ]}
              ]}, 1, 0
            ]} }
        }},
        { $sort: { delayed: -1, total: -1 } },
        { $limit: 10 }
      ]),

      // 4. Location Insights
      Order.aggregate([
        { $match: { 'pickupAddress.city': { $exists: true, $ne: null } } },
        { $group: {
            _id: '$pickupAddress.city',
            shipments: { $sum: 1 },
            delays: { $sum: { $cond: [
              { $or: [
                { $and: [
                  { $lt: ['$promisedDeliveryTime', now] },
                  { $not: { $in: ['$status', ['Delivered', 'Failed']] } }
                ]},
                { $and: [
                  { $ne: ['$delayReason', null] },
                  { $ne: ['$delayReason', 'None'] },
                  { $ne: ['$delayReason', ''] }
                ]}
              ]}, 1, 0
            ]} }
        }},
        { $sort: { delays: -1, shipments: -1 } },
        { $limit: 5 }
      ]),

      // 5. Recent Alerts
      Order.find({ 'transitLogs.0': { $exists: true } })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select('orderId status updatedAt deliveryAgent transitLogs')
        .lean()
    ]);

    console.log('[Analytics] DB queries completed.');

    // Safely map recent alerts
    const alerts = (recentAlerts || [])
      .filter(o => o.transitLogs && o.transitLogs.length > 0)
      .map(o => {
        const log = o.transitLogs[o.transitLogs.length - 1];
        return {
          id: o._id.toString(),
          orderId: o.orderId,
          status: log.status,
          timestamp: log.updatedAt,
          agent: o.deliveryAgent?.name || 'System',
          note: log.note
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        criticalShipments: criticalShipments || [],
        delayBreakdown: delayBreakdown || [],
        agentPerformance: agentPerformance || [],
        locationInsights: locationInsights || [],
        recentAlerts: alerts
      }
    });
  } catch (error) {
    console.error('[Analytics] Critical Error:', error);
    res.status(500).json({
      success: false,
      error: 'Analytics computation failed: ' + error.message
    });
  }
});

module.exports = { getDashboardAnalytics };
