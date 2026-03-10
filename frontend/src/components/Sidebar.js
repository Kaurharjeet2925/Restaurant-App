import React from "react";
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

const menus = {
  owner: [
    { icon: <Home size={20} />, label: "Home", path: "/dashboard" },
    { icon: <TableIcon size={20} />, label: "Dine-In", path: "/tables" },
    { icon: <ShoppingBag size={20} />, label: "POS", path: "/counter-pos" },
    { icon: <List size={20} />, label: "Menu Items", path: "/menu-items" },
    { icon: <List size={20} />, label: "Categories", path: "/categories" },
    { icon: <List size={20} />, label: "Orders", path: "/view-orders" },
    { icon: <Users size={20} />, label: "Customers", path: "/customers" },
    { icon: <BarChart3 size={20} />, label: "Reports", path: "/reports" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" }
  ],

  admin: [
    { icon: <Home size={20} />, label: "Home", path: "/dashboard" },
    { icon: <TableIcon size={20} />, label: "Dine-In", path: "/tables" },
    { icon: <ShoppingBag size={20} />, label: "POS", path: "/counter-pos" },
    { icon: <Coffee size={20} />, label: "Kitchen", path: "/kitchen" },
    { icon: <List size={20} />, label: "Menu Items", path: "/menu-items" },
    { icon: <List size={20} />, label: "Categories", path: "/categories" },
    { icon: <List size={20} />, label: "Orders", path: "/view-orders" },
    { icon: <Users size={20} />, label: "Customers", path: "/customers" },
    { icon: <BarChart3 size={20} />, label: "Reports", path: "/reports" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" }
  ],

  waiter: [
    { icon: <Home size={20} />, label: "Home", path: "/dashboard" },
    { icon: <TableIcon size={20} />, label: "Dine-In", path: "/tables" },
    { icon: <ShoppingBag size={20} />, label: "POS", path: "/counter-pos" },
  ],

  kitchen: [
    { icon: <Coffee size={20} />, label: "Kitchen Dashboard", path: "/kitchen" },
  ]
};

export default function Sidebar({ open, setOpen }) {

  const location = useLocation();
  const { isMobile } = useResponsive();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "waiter";

  const menu = menus[role] || [];

  return (
    <>
      <aside
        className={`
          w-64 bg-card border-r border-borderLight shadow-sm
          px-4 py-6 h-screen overflow-y-auto
          transition-transform duration-300
          ${isMobile ? "fixed top-0 left-0 z-40" : "relative"}
          ${open || !isMobile ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* LOGO */}
        <h2 className="text-2xl font-bold text-primary mb-8">
          Restro
        </h2>

        {/* MENU */}
        <ul className="space-y-2">

          {menu.map((item, i) => {

            const active = location.pathname.startsWith(item.path);

            return (
              <Link
                key={i}
                to={item.path}
                onClick={() => isMobile && setOpen(false)}
                className={`
                  flex items-center gap-3
                  px-4 py-2.5
                  rounded-lg
                  text-sm
                  transition
                  
                  ${
                    active
                      ? "bg-primaryLight text-primary font-semibold"
                      : "text-gray-600 hover:bg-gray-100 hover:text-primary"
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

      {/* MOBILE OVERLAY */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}