import React from "react";
import { Link, Outlet } from "react-router-dom";

const PlatformLayout = () => {
  return (
    <div className="min-h-screen flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6 space-y-4">
        <h2 className="text-xl font-bold">Platform Panel</h2>

        <Link to="/platform/register" className="block hover:text-gray-300">
          Register Restaurant
        </Link>
        <Link to="/platform/dashboard" className="block hover:text-gray-300">
          Dashboard
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default PlatformLayout;