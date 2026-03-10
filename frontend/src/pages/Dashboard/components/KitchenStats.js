import React, { useEffect, useState } from "react";
import apiClient from "../../../apiclient/apiclient";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  CookingPot
} from "lucide-react";

/* ================= SMALL CARD ================= */

const SmallKitchenCard = ({ title, value, type, icon }) => {

  const bgStyle = {
    normal: "bg-white",
    success: "bg-green-50",
    danger: "bg-red-50"
  };

  const textStyle = {
    normal: "text-slate-800",
    success: "text-green-600",
    danger: "text-red-500"
  };

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-3 py-3 shadow-sm ${bgStyle[type]}`}
    >

      {/* LEFT SIDE */}
      <div className="flex items-center gap-2 text-xs text-slate-600 min-w-0">

        <div className="text-slate-500 flex-shrink-0">
          {icon}
        </div>

        <span className="truncate">
          {title}
        </span>

      </div>

      {/* VALUE */}
      <span
        className={`text-base font-semibold flex-shrink-0 ${textStyle[type]}`}
      >
        {value}
      </span>

    </div>
  );
};


/* ================= MAIN COMPONENT ================= */

const KitchenStats = () => {

  const [summary, setSummary] = useState({});

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get("/dashboard/kitchen-monitor");
      setSummary(data.summary || {});
    } catch (error) {
      console.error("Kitchen stats error:", error);
    }
  };

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 10000);

    return () => clearInterval(interval);
  }, []);

  return (

    <div className="space-y-4 w-full">

      <SmallKitchenCard
        title="Orders in Kitchen"
        value={summary.kitchenCount || 0}
        type="normal"
        icon={<CookingPot size={18} />}
      />

      <SmallKitchenCard
        title="Ready for Service"
        value={summary.readyCount || 0}
        type="success"
        icon={<CheckCircle size={18} />}
      />

      <SmallKitchenCard
        title="Avg Prep Time"
        value={`${summary.avgPrep || 0} min`}
        type="normal"
        icon={<Clock size={18} />}
      />

      <SmallKitchenCard
        title="Delayed Orders"
        value={summary.delayedCount || 0}
        type="danger"
        icon={<AlertTriangle size={18} />}
      />

    </div>
  );
};

export default KitchenStats;