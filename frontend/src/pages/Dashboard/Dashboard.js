import React from 'react';
import StatCard from './components/StatCard';
import RecentOrders from './components/RecentOrders';
import DeliverySummary from './components/DeliverySummary';
import KitchenOrdersBoard from './components/kitchenOrdersVoard';
import PaymentStatusChart from './components/paymentStatusChart';
const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Restaurant Dashboard</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Today's Orders" value="34" />
        <StatCard title="Today's Sales" value="₹12,450" />
        <StatCard title="Pending Orders" value="6" />
        <StatCard title="Cancelled Orders" value="2" />
        <StatCard title="Items Sold" value="87" />
      </div>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <KitchenOrdersBoard />
        </div>
        <PaymentStatusChart />
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <DeliverySummary />
      </div>
    </div>
  );
};


export default Dashboard;
