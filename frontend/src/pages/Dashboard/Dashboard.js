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
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">
        Restaurant Dashboard
      </h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Today's Revenue" value={`₹${stats.totalSales}`} highlight />
        <StatCard title="Orders Today" value={stats.totalOrders} />
        <StatCard title="Avg Order Value" value={`₹${avgOrderValue}`} />
        <StatCard title="Items Sold" value={stats.itemsSold} />
      </div>

      {/* SALES TREND + PAYMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <SalesLineChart data={salesTrend} />
        </div>

        <PaymentStatusChart paymentData={paymentStats} />
      </div>

      {/* TOP PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

        {/* Top Items (2 columns) */}
        <div className="lg:col-span-2 flex flex-col justify-between h-full">
          <TopSellingItems items={topItems} />
        </div>

        {/* Kitchen Stats (1 column) */}
        <div className="flex flex-col gap-3 justify-between h-full">
          <KitchenStats />
        </div>
      </div>

      {/* FULL WIDTH LIVE KITCHEN */}
      <KitchenMonitor /> 
      
    </div>
  );
};

export default Dashboard;