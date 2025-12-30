import React, { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import KotList from "./Kot/KotList";

const KitchenDashboard = () => {
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(false);

  const lastFetchRef = React.useRef(0);

 const loadKots = async ({ silent = false, force = false } = {}) => {
  const now = Date.now();

  if (!force && now - lastFetchRef.current < 400) return;
  lastFetchRef.current = now;

  try {
    if (!silent) setLoading(true);

    const res = await apiClient.get("/kitchen/kots", {
      params: { t: Date.now() } // cache buster
    });

    setKots(res.data || []);
  } catch (error) {
    console.error("Failed to load KOTs", error);
  } finally {
    if (!silent) setLoading(false);
  }
};


 useEffect(() => {
  loadKots({ force: true });

  const interval = setInterval(
    () => loadKots({ silent: true }),
    10000
  );

  return () => clearInterval(interval);
}, []);


  // ✅ FILTER BY STATUS
  const pendingKots = kots.filter(k => k.status === "pending");
  const preparingKots = kots.filter(k => k.status === "preparing");
  const readyKots = kots.filter(k => k.status === "ready");

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          🍳 Kitchen Display System
        </h1>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-700 font-medium">
            Live
          </span>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-sm text-gray-500 mb-3">
          Loading kitchen orders...
        </div>
      )}

      {/* KDS COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KotList
          title="New Orders"
          status="pending"
          kots={pendingKots}
          reload={loadKots}
        />

        <KotList
          title="Preparing"
          status="preparing"
          kots={preparingKots}
          reload={loadKots}
        />

        <KotList
          title="Ready"
          status="ready"
          kots={readyKots}
          reload={loadKots}
        />
      </div>
    </div>
  );
};

export default KitchenDashboard;
