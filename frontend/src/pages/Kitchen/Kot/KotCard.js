import React, { useState, useEffect } from "react";
import apiClient from "../../../apiclient/apiclient";
import { toast } from "react-toastify";

/* ================= STATUS COLORS ================= */
const STATUS_HEADER_COLOR = {
  pending: "bg-red-500",
  preparing: "bg-yellow-400",
  ready: "bg-green-500",
};

const KotCard = ({ kot, reload }) => {
  /* ================= API ACTIONS ================= */
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start preparing");
    }
  };

  const toggleItemPrepared = async (index) => {
    // prevent duplicate requests
    if (updatingMap[index]) return;

    const prev = localItems;
    const updated = prev.map((it, i) => (i === index ? { ...it, status: "prepared" } : it));
    setLocalItems(updated);
    setUpdatingMap((m) => ({ ...m, [index]: true }));

    try {
      const res = await apiClient.put(
        `/orders/${kot.orderId}/kot/${kot.kotNo}/item/${index}/prepared`
      );

      // If server returned the updated KOT, use it; otherwise rely on optimistic update
      const serverKot = res.data?.kot;
      if (serverKot && Array.isArray(serverKot.items)) {
        setLocalItems(serverKot.items);
      } else {
        setLocalItems((prev2) => prev2.map((it, i) => (i === index ? { ...it, status: "prepared" } : it)));
      }

      toast.success(res.data?.message || "Item marked prepared");

      // trigger parent refresh (debounced slightly to allow UI update)
      setTimeout(() => reload(), 200);
    } catch (error) {
      console.error("toggleItemPrepared error:", error);
      setLocalItems(prev);
      toast.error(error.response?.data?.message || "Failed to mark item prepared");
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark KOT ready");
    }
  };

  const allPrepared = localItems.length > 0 && localItems.every((i) => i.status === "prepared");

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      {/* HEADER */}
      <div
        className={`px-3 py-2 flex justify-between text-white text-sm 
        ${STATUS_HEADER_COLOR[kot.status]}`}
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

      {/* BODY */}
     <div className="p-3 space-y-2">
  {localItems.map((item, index) => {
    const isServed = kot.status === "served";
    const isPrepared = item.status === "prepared";

    return (
      <div
        key={index}
        className="flex justify-between items-center border-b pb-1 text-sm"
      >
        {/* ITEM NAME */}
        <span className={isServed ? "line-through text-gray-400" : ""}>
          {item.name} x{item.qty}
        </span>

        {/* SWITCH (ONLY IN PREPARING) */}
        {kot.status === "preparing" && (
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPrepared}
              disabled={isPrepared}
              onChange={() => toggleItemPrepared(index)}
              className="sr-only"
            />
            <div
              className={`w-9 h-5 rounded-full transition ${
                isPrepared ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
                  isPrepared ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </div>
          </label>
        )}
      </div>
    );
  })}
</div>


      {/* FOOTER */}
      <div className="p-3 border-t">
        {/* PENDING */}
        {kot.status === "pending" && (
          <button
            onClick={startPreparing}
            className="w-full py-2 bg-gray-900 text-white rounded text-sm"
          >
            Start Preparing
          </button>
        )}

        {/* PREPARING */}
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

        {/* READY */}
        {kot.status === "ready" && (
          <p className="text-center text-green-600 font-semibold text-sm">
            ✔ Ready to Serve
          </p>
        )}
      </div>
    </div>
  );
};

export default KotCard;
