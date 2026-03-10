import React, { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import {  Edit2Icon, Eye, Trash } from "lucide-react";

const ViewOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
 const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
const [typeFilter, setTypeFilter] = useState("");
const [search, setSearch] = useState("");
const [paymentFilter, setPaymentFilter] = useState("");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
  /* ================= FETCH ORDERS ================= */
const fetchOrders = async () => {
  try {
    setLoading(true);

    let query = [];

    if (statusFilter) query.push(`status=${statusFilter}`);
    if (typeFilter) query.push(`orderType=${typeFilter}`);
    if (paymentFilter) query.push(`paymentStatus=${paymentFilter}`);
    if (search) query.push(`search=${search}`);
    if (startDate) query.push(`startDate=${startDate}`);
    if (endDate) query.push(`endDate=${endDate}`);

    const queryString = query.length ? `?${query.join("&")}` : "";

    const res = await apiClient.get(`/orders${queryString}`);
    const allOrders = res.data.data || [];

    setOrders(allOrders);
  } catch (err) {
    console.error("Failed to load orders", err);
  } finally {
    setLoading(false);
  }
};
const updateItemStatus = async (
  orderId,
  kotNo,
  index,
  status
) => {
  try {
    await apiClient.put(
      `/orders/${orderId}/kot/${kotNo}/item/${index}`,
      { status }
    );

    // refresh data
    await fetchOrders();

    // update selected order after refresh
    const updatedOrder = orders.find(o => o._id === orderId);
    setSelectedOrder(updatedOrder);

  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  fetchOrders();
}, [statusFilter, typeFilter, paymentFilter, startDate, endDate]);

  /* ================= DATE FORMAT ================= */
  const formatDateTime = (date) => {
    const d = new Date(date);

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
const handleView = (order) => {
  setSelectedOrder(order);
  setShowModal(true);
};

const handleEdit = (order) => {
  setSelectedOrder(order);
  setShowEditModal(true);
};

const handleDelete = async (id) => {
  if (!window.confirm("Are you sure?")) return;

  try {
    await apiClient.delete(`/orders/${id}`);
    fetchOrders();
  } catch (err) {
    console.error(err);
  }
};
  return (
    <div className="p-6 bg-background min-h-screen">

      {/* PAGE TITLE */}

      <h1 className="text-2xl font-semibold mb-6">
        Orders
      </h1>

      {/* FILTER BAR */}

      <div className="flex flex-wrap gap-3 mb-6 bg-card border border-borderLight rounded-xl p-4 shadow-card">

        <input
          type="text"
          placeholder="Search Order ID, Customer, Table..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-borderLight px-3 py-2 rounded text-sm w-72"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-borderLight px-3 py-2 rounded text-sm"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="served">Served</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-borderLight px-3 py-2 rounded text-sm"
        >
          <option value="">All Type</option>
          <option value="dine_in">Dine-In</option>
          <option value="counter">Counter</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="border border-borderLight px-3 py-2 rounded text-sm"
        >
          <option value="">All Payment</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-borderLight px-3 py-2 rounded text-sm"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-borderLight px-3 py-2 rounded text-sm"
        />

        <button
          onClick={() => {
            setStatusFilter("");
            setTypeFilter("");
            setPaymentFilter("");
            setStartDate("");
            setEndDate("");
          }}
          className="px-4 py-2 bg-primaryLight text-primary rounded text-sm"
        >
          Clear
        </button>

      </div>

      {/* TABLE */}

      <div className="bg-card border border-borderLight rounded-xl shadow-card">

        <div className="overflow-x-auto">

          <table className="w-full text-sm whitespace-nowrap">

            <thead className="bg-primaryLight text-gray-700">

              <tr>
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Table</th>
                <th className="p-3 text-left">Area</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">KOTs</th>
                <th className="p-3 text-left">Items</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Payment</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-left">Actions</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan="12" className="p-6 text-center">
                    Loading orders...
                  </td>
                </tr>

              ) : orders.length === 0 ? (

                <tr>
                  <td colSpan="12" className="p-6 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>

              ) : (

                orders.map((order) => {

                  const kotCount = order.kots?.length || 0;

                  return (

                    <tr
                      key={order._id}
                      className="border-t border-borderLight hover:bg-primaryLight"
                    >

                      <td className="p-3 font-medium">
                        {order.orderNumber || `#${order._id.slice(-6)}`}
                      </td>

                      <td className="p-3">
                        {order.orderType === "dine_in" ? "Dine-In" : "Counter"}
                      </td>

                      <td className="p-3 capitalize">
                        {order.status}
                      </td>

                      <td className="p-3">
                        {order.tableId?.tableNumber || "—"}
                      </td>

                      <td className="p-3">
                        {order.tableId?.area?.name || "—"}
                      </td>

                      <td className="p-3">
                        {order.customer?.name || "Walk-in"}
                      </td>

                      <td className="p-3">
                        {kotCount}
                      </td>

                      <td className="p-3">
                        {order.items?.length}
                      </td>

                      <td className="p-3 font-semibold">
                        ₹{order.totalAmount || 0}
                      </td>

                      <td className="p-3 capitalize">
                        {order.paymentStatus}
                      </td>

                      <td className="p-3">
                        {formatDateTime(order.createdAt)}
                      </td>

                      <td className="p-3 flex gap-3">

                        <button
                          onClick={() => handleView(order)}
                          className="text-primary"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleEdit(order)}
                          className="text-green-600"
                        >
                          <Edit2Icon size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(order._id)}
                          className="text-red-500"
                        >
                          <Trash size={16} />
                        </button>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default ViewOrder;
