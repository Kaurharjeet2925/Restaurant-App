import React, { useState, useEffect } from "react";
import StatCard from "./components/StatCard";
import SalesLineChart from "./components/SalesLineChart";
import TopSellingItems from "./components/TopSellingItems";
import PaymentStatusChart from "./components/paymentStatusChart";
import apiClient from "../../apiclient/apiclient";
import KitchenMonitor from "./components/KitchenMonitor";
import KitchenStats from "./components/KitchenStats";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    itemsSold: 0,
  });

  const [salesTrend, setSalesTrend] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { data } = await apiClient.get("/dashboard/stats");

        setStats({
          totalOrders: data.stats?.totalOrders || 0,
          totalSales: data.stats?.totalSales || 0,
          itemsSold: data.stats?.itemsSold || 0,
        });

        setSalesTrend(data.salesTrend || []);
        setTopItems(data.topItems || []);
        setPaymentStats(data.paymentStats || []);
      } catch (error) {
        console.error("Dashboard error", error);
      }
    };

    fetchDashboardStats();
  }, []);

  const avgOrderValue =
    stats.totalOrders > 0
      ? Math.round(stats.totalSales / stats.totalOrders)
      : 0;

  return (
   <div className="p-6  min-h-screen">

<h1 className="text-2xl font-bold mb-6 text-slate-800">
Restaurant Dashboard
</h1>

{/* TOP KPI CARDS */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">

<StatCard title="Today's Revenue" value={`₹${stats.totalSales}`} highlight />
<StatCard title="Orders Today" value={stats.totalOrders} />
<StatCard title="Avg Order Value" value={`₹${avgOrderValue}`} />
<StatCard title="Items Sold" value={stats.itemsSold} />

</div>


{/* KITCHEN MONITOR + SUMMARY */}
<div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mt-6">

  {/* Kitchen Monitor */}
  <div className="lg:col-span-3 h-[330px]">
    <KitchenMonitor />
  </div>

  {/* Kitchen Summary */}
  <div className="h-[330px] bg-teal-50 rounded-xl border border-green-200 p-4 flex flex-col justify-between">

    <h2 className="text-sm font-semibold text-green-700">
      Kitchen Summary
    </h2>

    <KitchenStats />

  </div>

</div>

{/* SALES TREND + PAYMENT */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

<div className="lg:col-span-2 bg-white rounded-xl border p-4">
<SalesLineChart data={salesTrend} />
</div>

<div className="bg-white rounded-xl border p-4">
<PaymentStatusChart paymentData={paymentStats} />
</div>

</div>


{/* TOP SELLING */}
<div className="mt-6 bg-white rounded-xl border p-4">
<TopSellingItems items={topItems} />
</div>

</div>
  );
};

export default Dashboard;