import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell"; // 🔔 ADD THIS
import ConfirmDialog from "./ConfirmDialog"; // Import the ConfirmDialog component

export default function Navbar() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const [q, setQ] = useState(params.get("q") || "");

  // ✅ show search only on POS & Menu pages
  const showSearch =
    location.pathname.includes("/counter-pos") ||
    location.pathname.includes("/menu");

  // ✅ get logged-in user
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const name = user?.name || "Admin";
  const profileImage = user?.image || null;

  // ✅ initials fallback
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // debounce writing to URL params
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
    <div className="h-16 bg-white shadow-sm flex items-center justify-between px-2 py-2 border-b">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {showSearch && (
          <input
            type="text"
            placeholder="Search menu items or categories..."
            className="border px-3 py-2 rounded-lg w-96 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search menu items"
          />
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* 🔔 NOTIFICATION BELL */}
        <NotificationBell />

        {/* Profile Dropdown */}
        <div className="relative ">
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full bg-[#ff4d4d]
                           flex items-center justify-center
                           text-white font-semibold text-sm"
              >
                {initials}
              </div>
            )}
            <span className="font-semibold text-gray-700 mr-8">
              {name}
            </span>
          </button>

          {showDropdown && (
            <div
              className="absolute right-0 mt-2 w-16 bg-white border rounded-lg shadow-lg z-10"
            >
              <button
                onClick={() => setShowConfirm(true)}
                className="block w-full text-left px-2 py-2 text-sm text-red-500 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
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
    </div>
  );
}
