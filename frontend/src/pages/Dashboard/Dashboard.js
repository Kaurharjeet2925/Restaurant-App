import React, { useState, useEffect } from "react";
import PageHeader from "../../components/pageHeader";
import { LayoutDashboard } from "lucide-react";
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
    <>
   <PageHeader
  title="Restaurant Dashboard"
  subtitle="Overview of restaurant operations and sales"

/>

  <div className="px-5 pb-6 min-h-screen bg-white">

      {/* HEADER */}
      

      {/* KPI CARDS */}
   <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

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
     <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">

        {/* Kitchen Monitor */}
<div
  className="
    xl:col-span-3
    bg-card rounded-2xl
    shadow-sm border border-borderLight
    overflow-hidden
  "
>
          <KitchenMonitor />

        </div>

        {/* Kitchen Summary */}
<div
  className="
    bg-card rounded-2xl
    shadow-sm border border-borderLight
    p-5
  "
>
          <h2 className="text-sm font-semibold text-primary mb-4">
            Kitchen Summary
          </h2>

          <KitchenStats />

        </div>

      </div>

      {/* SALES & PAYMENT */}
<div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-6">
<div
  className="
    xl:col-span-2
    bg-card rounded-2xl
    shadow-sm border border-borderLight
    p-5
  "
>
          <SalesLineChart data={salesTrend} />

        </div>

<div
  className="
    bg-card rounded-2xl
    shadow-sm border border-borderLight
    p-5
  "
>
          <PaymentStatusChart paymentData={paymentStats} />

        </div>

      </div>

      {/* TOP SELLING ITEMS */}
<div
  className="
    mt-6 bg-card rounded-2xl
    shadow-sm border border-borderLight
    p-5
  "
>
        <TopSellingItems items={topItems} />

      </div>

    </div>
</>
  );

};

export default Dashboard;