import React, { useState } from "react";
import apiClient from "../../apiclient/apiclient";

const DailyOrderWiseReport = () => {
  const [date, setDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);

  const fetchReport = async () => {
    if (!date) return alert("Please select date");

    try {
      const res = await apiClient.get(
        `/reports/daily-order-wise?date=${date}`
      );

      if (res.data.success) {
        setOrders(res.data.orders);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error("Report error", err);
      alert("Failed to load report");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Order-Wise Daily Sales Report
      </h2>

      {/* FILTER */}
      <div className="mb-4">
        <input
          type="date"
          className="border px-3 py-2"
          onChange={e => setDate(e.target.value)}
        />
        <button
          onClick={fetchReport}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Load
        </button>
      </div>

      {/* ORDERS */}
      {orders.map(order => (
        <div key={order._id} className="border rounded mb-6">
          {/* HEADER */}
          <div className="bg-gray-100 p-3 text-sm flex justify-between">
            <div>
              <b>Order:</b> {order.orderNo || order._id.slice(-6)} |{" "}
              <b>Table:</b> {order.tableId?.tableNumber || "Parcel"} |{" "}
              <b>Area:</b> {order.tableId?.area?.name || "-"}
            </div>
            <div>
              <b>Customer:</b>{" "}
              {order.tableId?.customerId
                ? `${order.tableId.customerId.name} (${order.tableId.customerId.phone})`
                : "Walk-in"}
            </div>
          </div>

          {/* ITEMS */}
          <table className="w-full text-sm border-t">
            <thead className="bg-gray-50">
              <tr>
                <th className="border p-2">Item</th>
                <th className="border p-2">Variant</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Rate</th>
                <th className="border p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item._id}>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2">{item.variant}</td>
                  <td className="border p-2">{item.qty}</td>
                  <td className="border p-2">₹{item.price}</td>
                  <td className="border p-2">₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTALS */}
          <div className="p-3 text-sm flex justify-end gap-6">
            <span>SubTotal: ₹{order.subTotal}</span>
            <span>Tax: ₹{order.tax}</span>
            <span>Service: ₹{order.serviceAmount}</span>
            <span>Discount: ₹{order.discount}</span>
            <b>Total: ₹{order.totalAmount}</b>
          </div>
        </div>
      ))}

      {/* SUMMARY */}
      {summary && (
        <div className="mt-6 border p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Daily Summary</h3>
          <p>Total Orders: {summary.totalOrders}</p>
          <p>Paid Orders: {summary.paidOrders}</p>
          <p>Unpaid Orders: {summary.unpaidOrders}</p>
          <p>Gross Sales: ₹{summary.grossSales}</p>
          <p>Tax: ₹{summary.tax}</p>
          <p>Net Sales: ₹{summary.netSales}</p>
        </div>
      )}
    </div>
  );
};

export default DailyOrderWiseReport;
