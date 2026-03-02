const Order = require("../models/order.model");
const ExcelJS = require("exceljs");

exports.salesReport = async (req, res) => {
  try {
    const { start, end, download } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Start and End date required",
      });
    }

    /* ================= DATE RANGE ================= */

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    /* ================= FETCH COMPLETED ORDERS ================= */

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: "completed",
    })
      .populate({
        path: "tableId",
        select: "tableNumber area customerId",
        populate: [
          { path: "area", select: "name" },
          { path: "customerId", select: "name phone" },
        ],
      })
      .populate({
        path: "customer",
        select: "name phone",
      })
      .sort({ createdAt: 1 });

    /* ================= SUMMARY ================= */

    let todaySales = 0;
    let weekSales = 0;
    let monthSales = 0;
    let topProductMap = {};

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    orders.forEach((order) => {
      const created = new Date(order.createdAt);
      const amount = order.totalAmount || 0;

      if (created >= todayStart) todaySales += amount;
      if (created >= weekStart) weekSales += amount;
      if (created >= monthStart) monthSales += amount;

      (order.items || []).forEach((item) => {
        topProductMap[item.name] =
          (topProductMap[item.name] || 0) + item.qty;
      });
    });

    let topProduct = "N/A";
    let topProductQty = 0;

    Object.entries(topProductMap).forEach(([name, qty]) => {
      if (qty > topProductQty) {
        topProduct = name;
        topProductQty = qty;
      }
    });

    const topProducts = Object.entries(topProductMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    /* ================= CHART DATA ================= */

    const chartMap = {};

    orders.forEach((order) => {
      const key = order.createdAt.toISOString().slice(0, 10);
      chartMap[key] =
        (chartMap[key] || 0) + (order.totalAmount || 0);
    });

    const chart = Object.keys(chartMap).map((date) => ({
      date,
      amount: chartMap[date],
    }));

    /* ================= TABLE DATA ================= */

    const table = orders.map((order) => ({
      orderNumber:
        order.orderNumber ||
        order._id.toString().slice(-6),

      customerName:
  order.customer?.name ||
  order.tableId?.customerId?.name ||
  "Walk-in",

      tableName:
        order.orderType === "counter"
          ? "Counter"
          : order.tableId?.tableNumber || "-",

      areaName:
        order.orderType === "counter"
          ? "-"
          : order.tableId?.area?.name || "-",

      subTotal: order.subTotal || 0,
      tax: order.tax || 0,
      serviceAmount: order.serviceAmount || 0,
      discount: order.discount || 0,
      totalAmount: order.totalAmount || 0,

      paymentMethod: order.paymentMethod || "-",
      paymentStatus: order.paymentStatus || "-",
      status: order.status,
    }));

    /* ================= EXCEL DOWNLOAD ================= */

    if (download === "true") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");

      worksheet.columns = [
        { header: "Order No", key: "orderNumber", width: 15 },
        { header: "Customer", key: "customerName", width: 20 },
        { header: "Table", key: "tableName", width: 15 },
        { header: "Area", key: "areaName", width: 15 },
        { header: "Sub Total", key: "subTotal", width: 12 },
        { header: "Tax", key: "tax", width: 12 },
        { header: "Service", key: "serviceAmount", width: 12 },
        { header: "Discount", key: "discount", width: 12 },
        { header: "Total", key: "totalAmount", width: 15 },
        { header: "Payment Method", key: "paymentMethod", width: 15 },
        { header: "Payment Status", key: "paymentStatus", width: 15 },
        { header: "Status", key: "status", width: 15 },
      ];

      table.forEach((row) => {
        worksheet.addRow(row);
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=sales-report-${start}-to-${end}.xlsx`
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    /* ================= NORMAL JSON RESPONSE ================= */

    res.json({
      success: true,
      cards: {
        todaySales,
        weekSales,
        monthSales,
        topProduct,
        topProductQty,
      },
      chart,
      topProducts,
      table,
    });

  } catch (err) {
    console.error("Sales report error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate sales report",
    });
  }
};