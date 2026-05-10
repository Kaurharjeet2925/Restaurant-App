import React, { useState, useEffect } from "react";
import apiClient from "../../../apiclient/apiclient";
import { toast } from "react-toastify";

const STATUS_HEADER_COLOR = {
  pending: "bg-red-500 text-white",
  preparing: "bg-yellow-500 text-black",
};

const KotCard = ({ kot, reload, isReadyColumn = false }) => {

  // ✅ INIT STATE ONCE
  const [localItems, setLocalItems] = useState(() => kot.items || []);
  const [updatingMap, setUpdatingMap] = useState({});

  // ✅ ONLY update when NEW KOT comes (NOT every render)
  useEffect(() => {
    setLocalItems(kot.items || []);
  }, [kot._id]);

  const cookingMinutes = Math.floor(
    (Date.now() - new Date(kot.createdAt)) / 60000
  );

  const timerColor =
    cookingMinutes > 15
      ? "text-red-500"
      : cookingMinutes > 8
      ? "text-yellow-500"
      : "text-green-500";

  /* ================= START PREPARING ================= */
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

  /* ================= TOGGLE ITEM ================= */
  const toggleItemPrepared = async (index) => {
    if (updatingMap[index]) return;

    setUpdatingMap((m) => ({ ...m, [index]: true }));

    try {
      const res = await apiClient.put(
        `/orders/${kot.orderId}/kot/${kot.kotNo}/item/${index}/prepared`
      );

      // ✅ IMPORTANT: always trust backend
      const updatedKot = res.data.kot;

      setLocalItems(updatedKot.items);

      // ❌ DO NOT call reload here (causes reset)
    } catch (err) {
      console.log(err);
      toast.error("Failed marking item prepared");
    } finally {
      setUpdatingMap((m) => {
        const copy = { ...m };
        delete copy[index];
        return copy;
      });
    }
  };

  /* ================= MARK KOT READY ================= */
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
<div
  className="
    bg-white border border-borderLight
    rounded-2xl shadow-sm
    hover:shadow-md
    transition-all duration-300
    overflow-hidden
  "
>
      {/* ================= HEADER ================= */}
      {!isReadyColumn && (
   <div
  className={`px-4 py-3 flex justify-between text-sm ${
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

          <span className={`text-xs font-semibold ${timerColor}`}>
            ⏱ {cookingMinutes}m
          </span>
        </div>
      )}

      {/* ================= ITEMS ================= */}
     <div className="p-4 space-y-4">
        {localItems.map((item, index) => {
          const prepared = item.preparedQty || 0;
          const isDone = prepared === item.qty;

          return (
            <div
  key={index}
  className="
    space-y-2 border-b border-borderLight
    pb-3 last:border-b-0
  "
>

              {/* ITEM NAME + BUTTON */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-800 font-medium">
                  {item.name}
                </span>

                {kot.status === "preparing" && !isReadyColumn && (
                  <button
                    onClick={() => toggleItemPrepared(index)}
                    disabled={isDone || updatingMap[index]}
className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${                      isDone
                        ? "bg-green-500 text-white cursor-not-allowed"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {updatingMap[index]
                      ? "Loading..."
                      : isDone
                      ? "Prepared ✓"
                      : `${prepared}/${item.qty}`}
                  </button>
                )}
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-gray-200 h-1 rounded">
                <div
                  className="bg-green-500 h-1 rounded transition-all"
                  style={{
                    width: `${(prepared / item.qty) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= FOOTER ================= */}
      {!isReadyColumn && (
        <div className="p-3 border-t">

          {kot.status === "pending" && (
            <button
              onClick={startPreparing}
              className="
  w-full py-2.5
  bg-gray-900 text-white
  rounded-xl text-sm font-medium
  hover:bg-black transition
"
            >
              Start Preparing
            </button>
          )}

          {kot.status === "preparing" && (
            <button
              onClick={markKotReady}
              disabled={!allPrepared}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
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