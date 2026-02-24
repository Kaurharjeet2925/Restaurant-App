const Order = require("../models/order.model");

module.exports = async function autoAdjustOrders(customerId, amount) {
  let remaining = Number(amount);
  if (remaining <= 0) return { adjusted: 0 };

  const orders = await Order.find({
    paymentType: "credit",
    paymentStatus: { $ne: "paid" },
    "customer.customerId": customerId,
  }).sort({ createdAt: 1 });

  let adjusted = 0;

  for (const order of orders) {
    if (remaining <= 0) break;

    const due = order.dueAmount || 0;

    const used = Math.min(due, remaining);

    order.dueAmount -= used;
    remaining -= used;
    adjusted += used;

    order.paymentStatus =
      order.dueAmount === 0 ? "paid" : "partial";

    await order.save();
  }

  return { adjusted, remaining };
};
