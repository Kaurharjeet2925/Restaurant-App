import React from "react";
import {
  Home,
  List,
  ShoppingBag,
  Users,
  Settings,
  BarChart3
} from "lucide-react";

const menu = [
  { icon: <Home size={20} />, label: "Dashboard" },
  { icon: <ShoppingBag size={20} />, label: "Orders" },
  { icon: <List size={20} />, label: "Menu Items" },
  { icon: <Users size={20} />, label: "Customers" },
  { icon: <BarChart3 size={20} />, label: "Reports" },
  { icon: <Settings size={20} />, label: "Settings" }
];

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white shadow-xl fixed left-0 top-0 px-4 py-6">
      <h2 className="text-2xl font-bold text-red-500 mb-8">Restro</h2>

      <ul className="space-y-3">
        {menu.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-3 px-4 py-2 cursor-pointer rounded-lg hover:bg-red-50 hover:text-red-500 transition"
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
