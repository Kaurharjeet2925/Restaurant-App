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

  /* Dummy sparkline data for cards */
  const dummyTrend = [1, 2, 4, 6, 7, 8, 10];

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

    <div className="p-5 min-h-screen bg-white">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Restaurant Dashboard
      </h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">

        <StatCard
          title="Today's Revenue"
          value={`₹${stats.totalSales}`}
          highlight
        />

        <StatCard
          title="Orders Today"
          value={stats.totalOrders}
          data={dummyTrend}
        />

        <StatCard
          title="Avg Order Value"
          value={`₹${avgOrderValue}`}
          data={dummyTrend}
        />

        <StatCard
          title="Items Sold"
          value={stats.itemsSold}
          data={dummyTrend}
        />

      </div>

      {/* KITCHEN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Kitchen Monitor */}
        <div className="lg:col-span-3 bg-card rounded-xl shadow-card border border-borderLight">

          <KitchenMonitor />

        </div>

        {/* Kitchen Summary */}
        <div className="bg-card rounded-xl shadow-card border border-borderLight p-5">

          <h2 className="text-sm font-semibold text-primary mb-4">
            Kitchen Summary
          </h2>

          <KitchenStats />

        </div>

      </div>

      {/* SALES & PAYMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-borderLight p-4">

          <SalesLineChart data={salesTrend} />

        </div>

        <div className="bg-card rounded-xl shadow-card border border-borderLight p-4">

          <PaymentStatusChart paymentData={paymentStats} />

        </div>

      </div>

      {/* TOP SELLING ITEMS */}
      <div className="mt-6 bg-card rounded-xl shadow-card border border-borderLight p-4">

        <TopSellingItems items={topItems} />

      </div>

    </div>

  );

};

export default Dashboard;