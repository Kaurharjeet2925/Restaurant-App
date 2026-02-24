import React, { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";

const ViewOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/orders");
      const allOrders = res.data.data || res.data || [];

      // ✅ SHOW ONLY COMPLETED ORDERS
      const completed = allOrders.filter(
        (o) => o.status === "completed"
      );

      setOrders(completed);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= HELPERS ================= */
const renderCustomer = (order) => {
  // Prefer direct customer field (for counter/credit), else use tableId.customerId for dine-in
  const customer = order.customer?.name
    ? order.customer
    : order.tableId?.customerId;
  if (customer?.name) {
    return (
      <div className="text-sm">
        <div className="font-medium">{customer.name}</div>
        {customer.phone && (
          <div className="text-gray-500">{customer.phone}</div>
        )}
        {order.paymentType === "credit" && (
          <span className="text-xs text-red-600 font-semibold">CREDIT</span>
        )}
      </div>
    );
  }
  return (
    <span className="text-gray-400 text-sm">Walk-in</span>
  );
};


  return (
    <div className="p-6">
      {/* ================= HEADER ================= */}
      <h1 className="text-xl font-semibold mb-6">
        Orders (Completed)
      </h1>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Table / Area</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Created</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-6 text-center">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No completed orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-gray-50 align-top"
                >
                  {/* ORDER ID */}
                  <td className="p-3 font-medium">
                    {order.orderDisplayId ||
                      `#${order._id.slice(-6)}`}
                  </td>

                  {/* TYPE */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.orderType === "dine_in"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {order.orderType === "dine_in"
                        ? "Dine-In"
                        : "Counter"}
                    </span>
                  </td>

                  {/* TABLE / AREA */}
                  <td className="p-3">
                    {order.orderType === "dine_in" ? (
                      <div className="text-sm">
                        <div className="font-medium">
                          Table {order.tableId?.tableNumber}
                        </div>
                        <div className="text-gray-500">
                          {order.tableId?.area?.name}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* CUSTOMER */}
                  <td className="p-3">
                    {renderCustomer(order)}
                  </td>

                  {/* ITEMS */}
                  <td className="p-3">
                    <div className="text-sm space-y-1">
                      {order.items?.length ? (
                        order.items.map((i, idx) => (
                          <div key={idx}>
                            {i.name}{i.variant ? ` (${i.variant})` : ''} × {i.qty}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* TOTAL */}
                  <td className="p-3 font-semibold">
                    ₹{order.totalAmount}
                  </td>

                  {/* PAYMENT & BALANCE */}
                  <td className="p-3">
                    <div>
                      <span className={`font-semibold px-2 py-1 rounded-full text-xs 
                        ${order.dueAmount === 0 ? 'bg-green-100 text-green-700' : order.dueAmount < order.totalAmount ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {order.dueAmount === 0 && 'Paid'}
                        {order.dueAmount < order.totalAmount && order.dueAmount > 0 && 'Partial'}
                        {order.dueAmount === order.totalAmount && 'Unpaid'}
                      </span>
                    </div>
                    {/* Always show balance, using dueAmount if present */}
                    <div className="text-xs text-gray-600 mt-1">
                      Balance: <span className="font-semibold">₹{
                        order.dueAmount !== undefined
                          ? order.dueAmount
                          : (order.balance !== undefined ? order.balance : 0)
                      }</span>
                    </div>
                    
                  </td>

                  {/* CREATED */}
                  <td className="p-3">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewOrder;
