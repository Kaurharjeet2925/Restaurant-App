import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../apiclient/apiclient";

const KitchenMonitor = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const { data } = await apiClient.get("/dashboard/kitchen-monitor");
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Kitchen monitor error", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  /* format time */
  const formatTime = (minutes) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m}m`;
    }
    return `${minutes}m`;
  };

  const openOrder = (tableId) => {
    if (!tableId) return;
    navigate(`/orders?tableId=${tableId}`);
  };

  return (
   <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full flex flex-col">

    <div className="flex justify-between items-center mb-4">

        <h2 className="text-lg font-semibold text-slate-800">
          Live Kitchen Orders
        </h2>

        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
          {orders.length} Active
        </span>

      </div>

  <div className="flex-1 overflow-y-auto pr-2">

        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No active kitchen orders
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-2">

            {orders.map((order) =>
              order.runningKots?.map((kot) => {

                const minutes = Math.floor(
                  (new Date() - new Date(kot.createdAt)) / 60000
                );

                /* timer color logic */

                let timerStyle = "bg-slate-100 text-slate-600";
                let borderStyle = "border-slate-200";

                if (minutes >= 10 && minutes < 15) {
                  timerStyle = "bg-yellow-400 text-black";
                }

                if (minutes >= 15) {
                  timerStyle = "bg-red-500 text-white";
                  borderStyle = "border-red-400";
                }

                /* status color */

                let statusStyle = "bg-slate-100 text-slate-600";

                if (kot.status === "pending")
                  statusStyle = "bg-red-100 text-red-600";

                if (kot.status === "preparing")
                  statusStyle = "bg-yellow-100 text-yellow-700";

                if (kot.status === "ready")
                  statusStyle = "bg-green-100 text-green-700";

                return (
                  <div
  key={`${order.orderId}-${kot.kotNo}`}
  onClick={() => openOrder(order.tableId)}
  className={`rounded-lg p-3 border transition shadow-sm cursor-pointer hover:shadow-md ${borderStyle}`}
>

  {/* HEADER */}
  <div className="flex justify-between items-start mb-1">

    <div>
      <div className="font-semibold text-xs text-slate-800">
        {order.orderNumber}
      </div>

      <div className="text-[11px] text-gray-500">
        KOT {kot.kotNo}
      </div>
    </div>

    <div className="flex flex-col gap-1">

      <span className={`text-[10px] px-2 py-[2px] rounded-full ${statusStyle}`}>
        {kot.status}
      </span>

      <span className={`text-[10px] px-2 py-[2px] rounded ${timerStyle}`}>
        {formatTime(minutes)}
      </span>

    </div>

  </div>

  {/* TABLE */}
<div className="text-[11px] text-gray-500 mb-1">
  {order.area && (
    <span className="font-medium text-slate-600">
      {order.area}
    </span>
  )}{" "}
  Table {order.table || "-"}
</div>

  {/* ITEMS */}
  {/* ITEMS */}
<div className="text-xs text-slate-700 space-y-[2px] relative group">

  {kot.items?.slice(0, 3).map((item, idx) => (
    <div key={idx}>
      {item.qty} × {item.name}
    </div>
  ))}

  {kot.items?.length > 3 && (
    <div className="text-[10px] text-blue-500 cursor-pointer">
      +{kot.items.length - 3} more
    </div>
  )}

  {/* Hover tooltip */}
  {kot.items?.length > 3 && (
    <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-white border border-slate-200 rounded-lg shadow-lg p-2 text-xs z-50 w-48 max-h-40 overflow-y-auto">

      {kot.items.map((item, idx) => (
        <div key={idx} className="py-[2px]">
          {item.qty} × {item.name}
        </div>
      ))}

    </div>
  )}

</div>

</div>
                );
              })
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenMonitor;