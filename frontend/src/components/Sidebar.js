import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useResponsive } from "../hooks/usResponsive";
import {
  Home,
  List,
  ShoppingBag,
  Users,
  Settings,
  BarChart3,
  Table as TableIcon,
  Coffee,
} from "lucide-react";

const menu = [
  { icon: <Home size={20} />, label: "Home", path: "/dashboard" },
  { icon: <TableIcon size={20} />, label: "Dine-In", path: "/tables" },
  { icon: <ShoppingBag size={20} />, label: "POS", path: "/counter-pos" },
  { icon: <Coffee size={20} />, label: "Kitchen", path: "/kitchen" },
  { icon: <List size={20} />, label: "Menu Items", path: "/menu-items" },
  { icon: <List size={20} />, label: "Categories", path: "/categories" },
  { icon: <List size={20} />, label: "Orders", path: "/view-orders" },
  { icon: <Users size={20} />, label: "Customers", path: "/customers" },
  { icon: <BarChart3 size={20} />, label: "Reports", path: "/reports" },
  { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
];

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const { isMobile } = useResponsive();

  return (
    <>
      <aside
        className={`
          w-64 bg-white shadow-xl px-4 py-6
          h-screen overflow-y-auto
          transition-transform duration-300

          ${isMobile ? "fixed top-0 left-0 z-40" : "relative"}
          ${open || !isMobile ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <h2 className="text-2xl font-bold text-red-500 mb-8">
          Restro
        </h2>

        <ul className="space-y-2">
          {menu.map((item, i) => {
            const active = location.pathname.startsWith(item.path);

            return (
              <Link
                key={i}
                to={item.path}
                onClick={() => isMobile && setOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg transition
                  ${
                    active
                      ? "bg-red-100 text-red-600 font-semibold"
                      : "hover:bg-red-50 hover:text-red-500"
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </ul>
      </aside>

      {/* Mobile overlay */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
