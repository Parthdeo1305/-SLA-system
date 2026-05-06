require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { Order } = require('../models/Order');
const Agent = require('../models/Agent');

const fixAgents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Fix] Connected to DB');

    // Reset all agents to available and clear currentOrderId
    await Agent.updateMany({}, { status: 'available', currentOrderId: null });

    // Find all orders that are currently active (Picked or In Transit)
    const activeOrders = await Order.find({ status: { $in: ['Picked', 'In Transit'] } });
    
    let busyCount = 0;
    for (const order of activeOrders) {
      if (order.deliveryAgent && order.deliveryAgent.agent) {
        // Mark this agent as busy with this order
        await Agent.findByIdAndUpdate(order.deliveryAgent.agent, {
          status: 'busy',
          currentOrderId: order._id
        });
        busyCount++;
      }
    }

    console.log(`[Fix] Fixed agents. ${busyCount} agents are now correctly marked as busy.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixAgents();
