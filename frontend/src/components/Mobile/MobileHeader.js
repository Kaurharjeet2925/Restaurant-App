import React, { useState,useMemo } from "react";
import NotificationBell from "../NotificationBell";
import ConfirmDialog from "../ConfirmDialog"; // Import the ConfirmDialog component
import { LogOut } from "lucide-react";

export default function MobileHeader({ onHamburgerClick }) {

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const role = user?.role;

  const [showConfirm, setShowConfirm] = useState(false);

  return (
   <div className="bg-[#ff4d4d] w-full sticky top-0 z-50">
  <div className="flex items-center justify-between px-4 py-3">

    {/* LEFT SIDE */}
    <div className="flex items-center gap-2">

      {/* Hamburger */}
      {role !== "kitchen" && role !== "waiter" ? (
        <button
          className="md:hidden text-white rounded p-2"
          onClick={onHamburgerClick}
          aria-label="Toggle sidebar"
        >
          <svg
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      ) : (
        <div className="w-8" />
      )}

      {/* Title */}
      <h1 className="text-xl font-bold text-white tracking-wide">
        Restro POS
      </h1>

    </div>

    {/* RIGHT SIDE */}
    <div className="flex items-center gap-2 text-white hover:text-red-300">

      {/* Notification */}
      <NotificationBell />

      {/* Logout */}
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2"
        aria-label="Logout"
      >
        <LogOut size={20} />
      </button>

    </div>

  </div>
  {showConfirm && (
        <ConfirmDialog
          message="Are you sure you want to logout?"
          onConfirm={() => {
            localStorage.removeItem("user");
            window.location.href = "/";
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
</div>
  );
}