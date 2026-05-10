import React, { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import {  Edit2Icon, Eye, Trash } from "lucide-react";
import PageHeader from "../../components/pageHeader";
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
 <div className="">
   
         {/* MOBILE HEADER */}
         <PageHeader
  title="Orders"
  subtitle="Manage and monitor restaurant orders"
/>
   
      {/* FILTER BAR */}
<div className="px-5 pb-6">
      <div
  className="
    bg-card border border-borderLight
    rounded-2xl shadow-sm
    p-4 sm:p-5 mb-6 
  "
>

  <div
    className="
      grid grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-6
      gap-4
    "
  >

    {/* SEARCH */}
    <input
      type="text"
      placeholder="Search Order / Customer / Table..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="
        border border-borderLight
        px-4 py-3 rounded-xl
        text-sm w-full
      "
    />

    {/* STATUS */}
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="
        border border-borderLight
        px-4 py-3 rounded-xl text-sm
      "
    >
      <option value="">All Status</option>
      <option value="pending">Pending</option>
      <option value="preparing">Preparing</option>
      <option value="ready">Ready</option>
      <option value="served">Served</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>

    {/* TYPE */}
    <select
      value={typeFilter}
      onChange={(e) => setTypeFilter(e.target.value)}
      className="
        border border-borderLight
        px-4 py-3 rounded-xl text-sm
      "
    >
      <option value="">All Type</option>
      <option value="dine_in">Dine-In</option>
      <option value="counter">Counter</option>
    </select>

    {/* PAYMENT */}
    <select
      value={paymentFilter}
      onChange={(e) => setPaymentFilter(e.target.value)}
      className="
        border border-borderLight
        px-4 py-3 rounded-xl text-sm
      "
    >
      <option value="">All Payment</option>
      <option value="paid">Paid</option>
      <option value="partial">Partial</option>
      <option value="unpaid">Unpaid</option>
    </select>

    {/* START */}
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="
        border border-borderLight
        px-4 py-3 rounded-xl text-sm
      "
    />

    {/* END */}
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="
        border border-borderLight
        px-4 py-3 rounded-xl text-sm
      "
    />

  </div>

  {/* CLEAR */}
  <div className="mt-4 flex justify-end">

    <button
      onClick={() => {
        setStatusFilter("");
        setTypeFilter("");
        setPaymentFilter("");
        setStartDate("");
        setEndDate("");
      }}
      className="
        px-5 py-2.5 rounded-xl
        bg-primaryLight text-primary
        hover:bg-primary hover:text-white
        transition
      "
    >
      Clear Filters
    </button>

  </div>

</div>

      {/* TABLE */}
<div className="bg-card border border-borderLight rounded-2xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

         <table className="min-w-[1600px] w-full text-sm whitespace-nowrap">

            <thead className="bg-primaryLight text-gray-700 text-xs uppercase">

              <tr>
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Table</th>
                <th className="p-3 text-left">Area</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">KOTs</th>
                <th className="p-3 text-left min-w-[220px]">Items</th>
                <th className="p-3 text-left">Subtotal</th>
                <th className="p-3 text-left">Tax</th>
                <th className="p-3 text-left">Discount</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Payment Status</th>
                <th className="p-3 text-left">Amount Received</th>
                <th className="p-3 text-left">Balance</th>
                <th className="p-3 text-left min-w-[170px]">Created</th>
                <th className="p-3 text-left">Actions</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan="16" className="p-6 text-center">
                    Loading orders...
                  </td>
                </tr>

              ) : orders.length === 0 ? (

                <tr>
                  <td colSpan="16" className="p-6 text-center text-gray-500">
                    No completed orders found
                  </td>
                </tr>

              ) : (

                orders.map((order) => {
                  const totalItems =
                    order.items?.reduce(
                      (sum, i) => sum + i.qty,
                      0
                    ) || 0;

                  const kotCount =
                    order.kots?.length || 0;

                  const amountReceived =
                    order.totalAmount &&
                    order.dueAmount !== undefined
                      ? order.totalAmount -
                        order.dueAmount
                      : order.totalAmount || 0;

                  const balance =
                    order.dueAmount !== undefined
                      ? order.dueAmount
                      : 0;

                  return (

                    <tr
                      key={order._id}
                      className="border-b hover:bg-gray-50"
                    >
                      {/* Order ID */}
                      <td className="p-3 font-medium">
                        {order.orderNumber || `#${order._id.slice(-6)}`}
                      </td>

                      {/* Type */}
                      <td className="p-3">
                        {order.orderType ===
                        "dine_in"
                          ? "Dine-In"
                          : "Counter"}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold
                          ${
                            order.status ===
                            "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status?.toUpperCase()}
                        </span>
                      </td>

                      {/* Table */}
                      <td className="p-3">
                        {order.tableId
                          ?.tableNumber || "—"}
                      </td>

                      {/* Area */}
                      <td className="p-3">
                        {order.tableId?.area
                          ?.name || "—"}
                      </td>

                      {/* Customer */}
                      <td className="p-3">
                        {order.customer?.name ||
                          order.tableId
                            ?.customerId?.name ||
                          "Walk-in"}
                      </td>

                      {/* KOTs */}
                      <td className="p-3 text-center font-semibold">
                        {kotCount}
                      </td>

                      {/* Items */}
                      <td className="p-3 align-top whitespace-normal min-w-[220px]">
                        {order.items?.length ? (
                          <div className="space-y-1">
                            {order.items.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="leading-tight"
                                >
                                  {item.name}
                                  {item.variant && (
                                    <span className="text-gray-500">
                                      {" "}
                                      (
                                      {item.variant}
                                      )
                                    </span>
                                  )}
                                  <span className="ml-1">
                                    ×{item.qty}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* Subtotal */}
                      <td className="p-3">
                        ₹{order.subTotal || 0}
                      </td>

                      {/* Tax */}
                      <td className="p-3">
                        ₹{order.tax || 0}
                      </td>

                      {/* Discount */}
                      <td className="p-3">
                        ₹{order.discount || 0}
                      </td>

                      {/* Total */}
                      <td className="p-3 font-semibold">
                        ₹{order.totalAmount || 0}
                      </td>

                      {/* Payment Status */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold
                          ${
                            order.paymentStatus ===
                            "paid"
                              ? "bg-green-100 text-green-700"
                              : order.paymentStatus ===
                                "partial"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.paymentStatus?.toUpperCase()}
                        </span>
                      </td>

                      {/* Amount Received */}
                      <td className="p-3">
                        ₹{amountReceived}
                      </td>



                      {/* Balance */}
                      <td className="p-3 font-semibold">
                        ₹{balance}
                      </td>



                      {/* Created */}
                      <td className="p-3 whitespace-nowrap min-w-[170px]">
                        {formatDateTime(
                          order.createdAt
                        )}
                      </td>
               <td className="p-3">
  <div className="flex items-center gap-2">

    <button
      onClick={() => handleView(order)}
      className="
        w-8 h-8 rounded-lg
        bg-blue-50 text-blue-600
        hover:bg-blue-100
        flex items-center justify-center
        transition
      "
    >
      <Eye size={16} />
    </button>

    <button
      onClick={() => handleEdit(order)}
      className="
        w-8 h-8 rounded-lg
        bg-green-50 text-green-600
        hover:bg-green-100
        flex items-center justify-center
        transition
      "
    >
      <Edit2Icon size={16} />
    </button>

    <button
      onClick={() => handleDelete(order._id)}
      className="
        w-8 h-8 rounded-lg
        bg-red-50 text-red-600
        hover:bg-red-100
        flex items-center justify-center
        transition
      "
    >
      <Trash size={16} />
    </button>

  </div>
</td>
                    </tr>

                  );
                })

              )}

            </tbody>

          </table>
        </div>
      </div>
      {showModal && selectedOrder && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
    <div className="
  bg-white rounded-2xl shadow-xl
  w-full max-w-2xl
  mx-4 p-6
  max-h-[85vh] overflow-y-auto
">
      <h2 className="text-lg font-semibold mb-4">
        Order Details - {selectedOrder.orderDisplayId}
      </h2>

      {selectedOrder.kots?.map((kot) => (
        <div key={kot.kotNo} className="mb-4 border p-3 rounded">
          <h3 className="font-semibold">
            KOT {kot.kotNo} - {kot.status}
          </h3>

          {kot.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                {item.name} ({item.variant}) ×{item.qty}
              </span>
              <span className="text-xs bg-gray-200 px-2 rounded">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      ))}

      <div className="text-right">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
{showEditModal && selectedOrder && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
    <div className="bg-white p-6 w-[700px] rounded shadow-lg max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">
        Update Order - {selectedOrder.orderDisplayId}
      </h2>

      {selectedOrder.kots?.map((kot) => (
        <div key={kot.kotNo} className="mb-4 border p-3 rounded">
          <h3 className="font-semibold mb-2">
            KOT {kot.kotNo}
          </h3>

          {kot.items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center text-sm mb-2"
            >
              <span>
                {item.name} ({item.variant}) ×{item.qty}
              </span>

              {/* STATUS DROPDOWN */}
              <select
                value={item.status}
                onChange={(e) =>
                  updateItemStatus(
                    selectedOrder._id,
                    kot.kotNo,
                    idx,
                    e.target.value
                  )
                }
                className="border px-2 py-1 text-xs rounded"
              >
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="served">Served</option>
              </select>
            </div>
          ))}
        </div>
      ))}

      <div className="text-right">
        <button
          onClick={() => setShowEditModal(false)}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
</div>
    </div>
  );
};

export default ViewOrder;
