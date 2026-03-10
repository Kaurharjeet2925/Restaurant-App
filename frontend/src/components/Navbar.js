import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import ConfirmDialog from "./ConfirmDialog";

export default function Navbar() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const [q, setQ] = useState(params.get("q") || "");

  /* SHOW SEARCH ONLY ON POS / MENU / ORDERS */
  const showSearch =
    location.pathname.includes("/counter-pos") ||
    location.pathname.includes("/menu") ||
    location.pathname.includes("/categories") ||
    location.pathname.includes("/orders");

  /* GET USER */
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const name = user?.name || "Admin";
  const profileImage = user?.image || null;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  /* SEARCH PARAM SYNC */
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q) next.set("q", q);
      else next.delete("q");
      setParams(next, { replace: true });
    }, 250);

    return () => clearTimeout(t);
  }, [q, params, setParams]);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="h-16 bg-primaryGradient text-white flex items-center justify-between px-6 shadow-navbar sticky top-0 z-50">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4 flex-1">

        {showSearch && (
          <input
            type="text"
            placeholder="Search menu items..."
            className="
              w-full max-w-md
              px-4 py-2
              rounded-lg
              text-sm
              text-gray-700
              focus:outline-none
              focus:ring-2
              focus:ring-white
            "
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        )}

      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        {/* NOTIFICATION */}
        <NotificationBell />

        {/* PROFILE */}
        <div className="relative">

          <button
            className="flex items-center gap-3"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="w-9 h-9 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white text-primary flex items-center justify-center font-semibold text-sm">
                {initials}
              </div>
            )}

            <span className="font-medium">{name}</span>
          </button>

          {/* DROPDOWN */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-white text-gray-700 border border-borderLight rounded-lg shadow-lg overflow-hidden">

              <button
                onClick={() => setShowConfirm(true)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-primary"
              >
                Logout
              </button>

            </div>
          )}

        </div>

        {/* CONFIRM DIALOG */}
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
    </div>
  );
}