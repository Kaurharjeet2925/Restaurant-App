const Order = require("../models/order.model");

exports.dailyOrderWiseReport = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: "Date required" });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    })
      .populate({
        path: "tableId",
        select: "tableNumber area customerId",
         populate: [
          { path: "customerId", select: "name phone" },
          { path: "area", select: "name" },
        ],
		
      })
      .sort({ createdAt: 1 });

    // SUMMARY (ONLY PAID)
    let summary = {
      totalOrders: orders.length,
      paidOrders: 0,
      unpaidOrders: 0,
      grossSales: 0,
      tax: 0,
      serviceAmount: 0,
      discount: 0,
      netSales: 0
    };

    orders.forEach(o => {
      if (o.paymentStatus === "paid") {
        summary.paidOrders++;
        summary.grossSales += o.subTotal || 0;
        summary.tax += o.tax || 0;
        summary.serviceAmount += o.serviceAmount || 0;
        summary.discount += o.discount || 0;
        summary.netSales += o.totalAmount || 0;
      } else {
        summary.unpaidOrders++;
      }
    });

    res.json({
      success: true,
      orders,
      summary
    });
  } catch (err) {
    console.error("Daily report error:", err);
    res.status(500).json({ success: false, message: "Report failed" });
  }
};
