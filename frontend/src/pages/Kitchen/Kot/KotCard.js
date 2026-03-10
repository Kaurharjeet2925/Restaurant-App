import React, { useState, useEffect } from "react";
import apiClient from "../../../apiclient/apiclient";
import { toast } from "react-toastify";

const STATUS_HEADER_COLOR = {
  pending: "bg-red-500 text-white",
  preparing: "bg-yellow-500 text-black",
};

const KotCard = ({ kot, reload, isReadyColumn = false }) => {
  const [localItems, setLocalItems] = useState(kot.items || []);
  const [updatingMap, setUpdatingMap] = useState({});

  useEffect(() => {
    setLocalItems(kot.items || []);
  }, [kot.items]);

  const cookingMinutes = Math.floor(
    (Date.now() - new Date(kot.createdAt)) / 60000
  );

  const timerColor =
    cookingMinutes > 15
      ? "text-red-500"
      : cookingMinutes > 8
      ? "text-yellow-500"
      : "text-green-500";

  const startPreparing = async () => {
    try {
      await apiClient.patch(`/orders/${kot.orderId}/kot/${kot.kotNo}/status`, {
        status: "preparing",
      });
      reload();
    } catch {
      toast.error("Failed to start preparing");
    }
  };

  const toggleItemPrepared = async (index) => {
    if (updatingMap[index]) return;

    setUpdatingMap((m) => ({ ...m, [index]: true }));

    try {
      await apiClient.put(
        `/orders/${kot.orderId}/kot/${kot.kotNo}/item/${index}/prepared`
      );

      setLocalItems((items) =>
        items.map((it, i) =>
          i === index ? { ...it, status: "prepared" } : it
        )
      );

      reload();
    } catch {
      toast.error("Failed marking item prepared");
    } finally {
      setUpdatingMap((m) => {
        const copy = { ...m };
        delete copy[index];
        return copy;
      });
    }
  };

  const markKotReady = async () => {
    try {
      await apiClient.put(`/orders/${kot.orderId}/kot/${kot.kotNo}/ready`);
      reload();
    } catch {
      toast.error("Failed marking KOT ready");
    }
  };

  const allPrepared =
    localItems.length > 0 &&
    localItems.every((i) => i.status === "prepared");

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">

      {!isReadyColumn && (
        <div
          className={`px-3 py-2 flex justify-between text-sm ${
            STATUS_HEADER_COLOR[kot.status] || "bg-gray-100"
          }`}
        >
          <div>
            <p className="font-semibold">{kot.orderNumber}</p>
            <p className="text-xs">
              {kot.areaName} · Table {kot.tableNumber}
            </p>
            <p className="text-xs">KOT #{kot.kotNo}</p>
          </div>

          <span className="text-xs font-semibold">
            ⏱ {cookingMinutes}m
          </span>
        </div>
      )}

      <div className="p-3 space-y-2">

        {localItems.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center border-b pb-1 text-sm"
          >

            <span className="text-gray-800">
              {item.name} x{item.qty}
            </span>

            {kot.status === "preparing" && !isReadyColumn && (
              <input
                type="checkbox"
                checked={item.status === "prepared"}
                disabled={item.status === "prepared"}
                onChange={() => toggleItemPrepared(index)}
              />
            )}
          </div>
        ))}
      </div>

      {!isReadyColumn && (
        <div className="p-3 border-t">

          {kot.status === "pending" && (
            <button
              onClick={startPreparing}
              className="w-full py-2 bg-gray-900 text-white rounded text-sm"
            >
              Start Preparing
            </button>
          )}

          {kot.status === "preparing" && (
            <button
              onClick={markKotReady}
              disabled={!allPrepared}
              className={`w-full py-2 rounded text-sm font-semibold ${
                allPrepared
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Mark KOT Ready
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default KotCard;