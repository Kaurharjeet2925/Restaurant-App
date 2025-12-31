import React, { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

export default function Navbar() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const [q, setQ] = useState(params.get("q") || "");

  // show search only on Order or Menu pages
  const showSearch = location.pathname.includes("/order") || location.pathname.includes("/menu");

  // debounce writing to URL params
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q) next.set("q", q); else next.delete("q");
      setParams(next, { replace: true });
    }, 250);
    return () => clearTimeout(t);
  }, [q, params, setParams]);

  return (
    <div className="ml-64 h-16 bg-white shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {showSearch && (
          <input
            type="text"
            placeholder="Search menu items or categories..."
            className="border px-3 py-2 rounded-lg w-96 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search menu items"
          />
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <span className="font-semibold">Admin</span>
      </div>
    </div>
  );
}
