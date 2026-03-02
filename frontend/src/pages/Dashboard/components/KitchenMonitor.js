import React, { useEffect, useState } from "react";
import apiClient from "../../../apiclient/apiclient";

const KitchenMonitor = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data } = await apiClient.get("/dashboard/kitchen-monitor");
    setOrders(data.orders || []);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-8 p-6">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Live Kitchen Orders
        </h2>

        <span className="text-sm text-slate-500">
          {orders.length} Active
        </span>
      </div>

      <div className="max-h-[500px] overflow-y-auto pr-2">

        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No active kitchen orders
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {orders.map((order, i) => {
              const delayed = order.minutes > 15;

              return (
                <div
                  key={i}
                  className={`rounded-xl p-4 border shadow-sm transition
                    ${delayed
                      ? "bg-red-50 border-red-300"
                      : "bg-slate-50 border-slate-200"
                    }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-semibold">
                      {order.orderNumber}
                    </div>

                    <div
                      className={`text-xs px-2 py-1 rounded-full
                        ${delayed
                          ? "bg-red-100 text-red-600"
                          : "bg-slate-200 text-slate-600"
                        }`}
                    >
                      {order.minutes} min ⏱
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-2">
                    Table {order.table || "-"}
                  </div>

                  <div className="space-y-1 text-sm">
                    {order.items?.map((item, idx) => (
                      <div key={idx}>
                        {item.qty} {item.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default KitchenMonitor;