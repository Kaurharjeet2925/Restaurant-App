import React from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Home,
  List,
  ShoppingBag,
  Users,
  Settings,
  BarChart3
} from "lucide-react";

const menu = [
  { icon: <Home size={20} />, label: "Dashboard", path: "/dashboard" },
  { icon: <ShoppingBag size={20} />, label: "Orders", path: "/orders" },
  { icon: <List size={20} />, label: "Menu Items", path: "/menu-items" },
  { icon: <List size={20} />, label: "Categories", path: "/categories" },
  { icon: <Users size={20} />, label: "Customers", path: "/customers" },
  { icon: <BarChart3 size={20} />, label: "Reports", path: "/reports" },
  { icon: <Settings size={20} />, label: "Settings", path: "/settings" }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-white shadow-xl fixed left-0 top-0 px-4 py-6">
      <h2 className="text-2xl font-bold text-red-500 mb-8">Restro</h2>

      <ul className="space-y-3">
        {menu.map((item, i) => {
          const active = location.pathname === item.path;

          return (
            <Link
              to={item.path}
              key={i}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer rounded-lg transition 
                ${active ? "bg-red-100 text-red-600 font-semibold" : "hover:bg-red-50 hover:text-red-500"}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </ul>
    </div>
  );
}
