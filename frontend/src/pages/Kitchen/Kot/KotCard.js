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
    <div className="bg-card border border-borderLight rounded-xl shadow-card hover:shadow-lg transition overflow-hidden">

{/* HEADER */}

<div className="px-4 py-3 flex justify-between items-start bg-primaryLight">

<div>

<p className="font-semibold text-primary text-sm">
{kot.orderNumber}
</p>

<p className="text-xs text-gray-600">
{kot.areaName} • Table {kot.tableNumber}
</p>

<p className="text-xs text-gray-500">
KOT #{kot.kotNo}
</p>

</div>

<span className={`text-sm font-semibold ${timerColor}`}>
⏱ {cookingMinutes}m
</span>

</div>


{/* ITEMS */}

<div className="p-4 space-y-2">

{localItems.map((item,index)=>(
<div
key={index}
className="flex justify-between items-center border-b border-borderLight pb-2"
>

<span
className={`text-sm ${
item.status==="prepared"
? "line-through text-gray-400"
: "text-gray-800"
}`}
>

{item.name} × {item.qty}

</span>

{kot.status==="preparing" && !isReadyColumn && (

<input
type="checkbox"
checked={item.status==="prepared"}
disabled={item.status==="prepared"}
onChange={()=>toggleItemPrepared(index)}
className="w-4 h-4 accent-primary"
/>

)}

</div>
))}

</div>


{/* ACTIONS */}

{!isReadyColumn && (

<div className="p-4 border-t border-borderLight">

{kot.status==="pending" && (

<button
onClick={startPreparing}
className="w-full py-2 rounded-lg bg-primary text-white hover:bg-primaryDark transition font-medium"
>

Start Preparing

</button>

)}

{kot.status==="preparing" && (

<button
onClick={markKotReady}
disabled={!allPrepared}
className={`w-full py-2 rounded-lg font-medium transition ${
allPrepared
? "bg-green-600 hover:bg-green-700 text-white"
: "bg-gray-200 text-gray-400 cursor-not-allowed"
}`}
>

Mark Ready

</button>

)}

</div>

)}

</div>
  );
};

export default KotCard;