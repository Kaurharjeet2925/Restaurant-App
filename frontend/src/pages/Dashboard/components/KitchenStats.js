import React, { useEffect, useState } from "react";
import apiClient from "../../../apiclient/apiclient";

const SmallKitchenCard = ({ title, value, green, red }) => {
  return (
    <div
      className={`rounded-xl p-3 shadow-sm border flex gap-4 item-center justify-between
        ${green ? "bg-green-50 border-green-200" : ""}
        ${red ? "bg-red-50 border-red-200" : ""}
        ${!green && !red ? "bg-white border-slate-200" : ""}
      `}
    >
      <p className="text-xs text-slate-500">{title}</p>
      <h3
        className={`text-xl font-bold mt-1
          ${green ? "text-green-600" : ""}
          ${red ? "text-red-600" : ""}
        `}
      >
        {value}
      </h3>
    </div>
  );
};

const KitchenStats = () => {
  const [summary, setSummary] = useState({});

  const fetchStats = async () => {
    const { data } = await apiClient.get("/dashboard/kitchen-monitor");
    setSummary(data.summary || {});
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      <SmallKitchenCard
        title="Orders in Kitchen"
        value={summary.kitchenCount || 0}
      />

      <SmallKitchenCard
        title="Ready for Service"
        value={summary.readyCount || 0}
        green
      />

      <SmallKitchenCard
        title="Avg Prep Time"
        value={`${summary.avgPrep || 0} min`}
      />

      <SmallKitchenCard
        title="Delayed Orders"
        value={summary.delayedCount || 0}
        red
      />
    </div>
  );
};

export default KitchenStats;