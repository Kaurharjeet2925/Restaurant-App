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
         <div className="block md:hidden mb-4 ">
           <PageHeader title="Orders"/>
         </div>
   
         {/* DESKTOP TITLE */}
         <h1 className="hidden md:block text-3xl font-bold text-gray-800  p-5" >
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
                      <td className="p-3 space-x-2">
  <button
    onClick={() => handleView(order)}
    className=" text-blue-500 text-xs rounded"
  >
   <Eye width={16} height={16}/>
  </button>

  <button
    onClick={() => handleEdit(order)}
    className=" text-green-500 text-xs rounded"
  >
   <Edit2Icon width={16} height={16}/>
  </button>

  <button
    onClick={() => handleDelete(order._id)}
    className=" text-red-500 text-xs rounded-full"
  >
     <Trash width={16} height={16} />
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
      {showModal && selectedOrder && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
    <div className="bg-white p-6 w-[600px] rounded shadow-lg max-h-[80vh] overflow-y-auto">
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
  );
};

export default ViewOrder;
