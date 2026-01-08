import React, { useEffect, useState, useContext } from "react";
import apiClient from "../../apiclient/apiclient";
import KotList from "./Kot/KotList";
import { SocketContext } from "../../context/SocketContext";

/* ================= STATUS CARD (MOBILE) ================= */
const StatusCard = ({ title, count, color, onClick }) => (
  <div
    onClick={onClick}
    className={`${color} text-white rounded-lg p-5 cursor-pointer shadow`}
  >
    <div className="text-lg font-semibold">{title}</div>
    <div className="text-3xl font-bold mt-1">{count}</div>
  </div>
);

const KitchenDashboard = () => {
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState(null); // mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const socket = useContext(SocketContext);
  const lastFetchRef = React.useRef(0);

  /* ================= HANDLE RESIZE ================= */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setActiveStatus(null); // reset mobile state
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= LOAD KOTS ================= */
  const loadKots = async ({ silent = false, force = false } = {}) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 400) return;
    lastFetchRef.current = now;

    try {
      if (!silent) setLoading(true);
      const res = await apiClient.get("/kitchen/kots", {
        params: { t: Date.now() },
      });
      setKots(res.data || []);
    } catch (error) {
      console.error("Failed to load KOTs", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  /* ================= INITIAL LOAD + POLLING ================= */
  useEffect(() => {
    loadKots({ force: true });
    const interval = setInterval(
      () => loadKots({ silent: true }),
      10000
    );
    return () => clearInterval(interval);
  }, []);

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
    if (!socket) return;

    const refresh = () => loadKots({ silent: true, force: true });

    socket.on("kitchen.kot.sent", refresh);
    socket.on("kot.statusChanged", refresh);
    socket.on("kot.updated", refresh);

    return () => {
      socket.off("kitchen.kot.sent", refresh);
      socket.off("kot.statusChanged", refresh);
      socket.off("kot.updated", refresh);
    };
  }, [socket]);

  /* ================= FILTERS ================= */
  const pendingKots = kots.filter((k) => k.status === "pending");
  const preparingKots = kots.filter((k) => k.status === "preparing");
  const readyKots = kots.filter(
    (k) => k.status === "ready" || k.status === "served"
  );

  /* ================= UI ================= */
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          🍳 Kitchen Display System
        </h1>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-700 font-medium">Live</span>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-gray-500 mb-3">
          Loading kitchen orders...
        </div>
      )}

      {/* ================= MOBILE VIEW ================= */}
      {isMobile && !activeStatus && (
        <div className="space-y-4">
          <StatusCard
            title="Pending"
            count={pendingKots.length}
            color="bg-red-500"
            onClick={() => setActiveStatus("pending")}
          />
          <StatusCard
            title="Preparing"
            count={preparingKots.length}
            color="bg-yellow-400"
            onClick={() => setActiveStatus("preparing")}
          />
          <StatusCard
            title="Ready"
            count={readyKots.length}
            color="bg-green-500"
            onClick={() => setActiveStatus("ready")}
          />
        </div>
      )}

      {/* MOBILE LIST VIEW */}
      {isMobile && activeStatus && (
        <>
          <button
            onClick={() => setActiveStatus(null)}
            className="mb-3 text-blue-600 text-sm"
          >
            ← Back
          </button>

          {activeStatus === "pending" && (
            <KotList title="Pending" kots={pendingKots} reload={loadKots} />
          )}
          {activeStatus === "preparing" && (
            <KotList title="Preparing" kots={preparingKots} reload={loadKots} />
          )}
          {activeStatus === "ready" && (
            <KotList
              title="Ready"
              kots={readyKots}
              reload={loadKots}
              isReadyColumn
            />
          )}
        </>
      )}

      {/* ================= DESKTOP VIEW ================= */}
      {!isMobile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KotList title="New Orders" kots={pendingKots} reload={loadKots} />
          <KotList title="Preparing" kots={preparingKots} reload={loadKots} />
          <KotList
            title="Ready"
            kots={readyKots}
            reload={loadKots}
            isReadyColumn
          />
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;
