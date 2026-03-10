import React, { useEffect, useState, useContext, useRef } from "react";
import apiClient from "../../apiclient/apiclient";
import KotList from "./Kot/KotList";
import { NotificationContext } from "../../context/NotificationContext";
import PageHeader from "../../components/pageHeader";

const StatusCard = ({ title, count, color, onClick }) => (
  <div
    onClick={onClick}
    className={`${color} text-white rounded-xl p-5 cursor-pointer shadow hover:scale-[1.02] transition`}
  >
    <div className="text-lg font-semibold">{title}</div>
    <div className="text-3xl font-bold mt-1">{count}</div>
  </div>
);

const KitchenDashboard = () => {
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { notifications } = useContext(NotificationContext);
  const lastFetchRef = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setActiveStatus(null);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    } catch (err) {
      console.error("Failed loading KOTs", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadKots({ force: true });

    const interval = setInterval(() => {
      loadKots({ silent: true });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!notifications?.length) return;

    const latest = notifications[0];

    if (
      latest.activityType === "order" ||
      latest.activityType === "kitchen"
    ) {
      loadKots({ silent: true, force: true });
    }
  }, [notifications]);

  const pendingKots = kots.filter((k) => k.status === "pending");
  const preparingKots = kots.filter((k) => k.status === "preparing");
  const readyKots = kots.filter((k) => k.status === "ready");
  const servedKots = kots.filter((k) => k.status === "served");

  return (
   <div className="min-h-screen bg-background">

<PageHeader
  title={
    activeStatus
      ? activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1)
      : "Kitchen Display System"
  }
  backButton={!!activeStatus}
  onBack={() => setActiveStatus(null)}
/>

{loading && (
  <div className="text-center text-gray-400 py-4">
    Loading kitchen orders...
  </div>
)}

{!isMobile && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">

    <KotList title="Pending" kots={pendingKots} reload={loadKots} />

    <KotList title="Preparing" kots={preparingKots} reload={loadKots} />

    <KotList
      title="Ready"
      kots={readyKots}
      reload={loadKots}
      isReadyColumn
    />

    <KotList title="Served" kots={servedKots} reload={loadKots} />

  </div>
  
)}
</div>
  );
};

export default KitchenDashboard;