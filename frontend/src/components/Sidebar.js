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
  { icon: <Home size={20} />, label: "Dashboard", path: "/dashboard" },
  { icon: <TableIcon size={20} />, label: "Dine-In", path: "/tables" },
  { icon: <ShoppingBag size={20} />, label: "POS", path: "/counter-pos" },
  { icon: <Coffee size={20} />, label: "Kitchen", path: "/kitchen" },
  { icon: <List size={20} />, label: "Menu Items", path: "/menu-items" },
  { icon: <List size={20} />, label: "Categories", path: "/categories" },
  { icon: <Users size={20} />, label: "Customers", path: "/customers" },
  { icon: <BarChart3 size={20} />, label: "Reports", path: "/reports" },
  { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
];

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const { isMobile } = useResponsive();

  return (
    <>
      {/* Hamburger removed; now controlled from MobileHome */}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64
          bg-white shadow-xl px-4 py-6
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block
        `}
      >
        {/* Logo */}
        <h2 className="text-2xl font-bold text-red-500 mb-8">
          Restro
        </h2>

        {/* Menu */}
        <ul className="space-y-2">
          {menu.map((item, i) => {
            const active = location.pathname.startsWith(item.path);

            return (
              <Link
                key={i}
                to={item.path}
                onClick={() => setOpen && setOpen(false)}
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

      {/* ================= OVERLAY (MOBILE ONLY) ================= */}
      {open && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setOpen && setOpen(false)}
        />
      )}
    </>
  );
}
