import React, { useState, useEffect } from "react";
import apiClient from "../../../apiclient/apiclient";
import { toast } from "react-toastify";

/* Header colors for Pending & Preparing ONLY */
const STATUS_HEADER_COLOR = {
  pending: "bg-red-500 text-white",
  preparing: "bg-yellow-400 text-black",
};

const KotCard = ({ kot, reload, isReadyColumn = false }) => {
  const [localItems, setLocalItems] = useState(kot.items || []);
  const [updatingMap, setUpdatingMap] = useState({});

  useEffect(() => {
    setLocalItems(kot.items || []);
  }, [kot.items]);

  const startPreparing = async () => {
    try {
      await apiClient.patch(`/orders/${kot.orderId}/send-to-kitchen`, {
        orderId: kot.orderId,
        kotNo: kot.kotNo,
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

      setTimeout(() => reload(), 200);
    } catch {
      toast.error("Failed to mark item prepared");
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
      toast.error("Failed to mark KOT ready");
    }
  };

  const allPrepared =
    localItems.length > 0 &&
    localItems.every((i) => i.status === "prepared");

  const isServed = kot.status === "served";

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* HEADER – hidden ONLY in Ready column */}
      {!isReadyColumn && (
        <div
          className={`px-3 py-2 flex justify-between text-sm ${
            STATUS_HEADER_COLOR[kot.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          <div>
            <p className="font-semibold">
              {kot.areaName} · Table {kot.tableNumber}
            </p>
            <p className="text-xs">KOT #{kot.kotNo}</p>
          </div>

          <span className="text-xs">
            {new Date(kot.createdAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* BODY – always shown */}
      <div className="p-3 space-y-2">
        {localItems.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center border-b pb-1 text-sm"
          >
            <span
              className={
                isServed
                  ? "line-through text-gray-400"
                  : "text-gray-800"
              }
            >
              {item.name} x{item.qty}
            </span>

            {/* Switch ONLY in Preparing & NOT Ready column */}
            {kot.status === "preparing" && !isReadyColumn && (
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.status === "prepared"}
                  disabled={item.status === "prepared"}
                  onChange={() => toggleItemPrepared(index)}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-4 rounded-full transition ${
                    item.status === "prepared"
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full shadow transform transition ${
                      item.status === "prepared"
                        ? "translate-x-4"
                        : "translate-x-1"
                    }`}
                  />
                </div>
              </label>
            )}
          </div>
        ))}
      </div>

      {/* FOOTER – hidden ONLY in Ready column */}
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
              className={`w-full py-2 rounded text-sm ${
                allPrepared
                  ? "bg-gray-900 text-white"
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
