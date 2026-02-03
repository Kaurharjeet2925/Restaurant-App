import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

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

  return (
    <div className="ml-64 h-16 bg-white shadow-sm flex items-center justify-between px-6">
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
      <div className="flex items-center gap-3">
        {/* Avatar */}
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

        {/* Name */}
        <span className="font-semibold text-gray-700">
          {name}
        </span>
      </div>
    </div>
  );
}
