import React, { useState, useMemo } from "react";
import NotificationBell from "../NotificationBell";
import ConfirmDialog from "../ConfirmDialog";
import { LogOut, Menu } from "lucide-react";

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
    <div className="bg-primary text-white w-full fixed top-0 z-50 shadow-sm">

      <div className="flex items-center justify-between px-4 py-3">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {role !== "kitchen" && role !== "waiter" ? (
            <button
              className="p-2 rounded-lg hover:bg-white/20 transition"
              onClick={onHamburgerClick}
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
          ) : (
            <div className="w-8" />
          )}

          <h1 className="text-lg font-semibold tracking-wide">
            Restro POS
          </h1>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">

          {/* Notifications */}
          <div className="p-2 rounded-lg hover:bg-white/20 transition">
            <NotificationBell />
          </div>

          {/* Logout */}
          <button
            onClick={() => setShowConfirm(true)}
            className="p-2 rounded-lg hover:bg-white/20 transition"
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