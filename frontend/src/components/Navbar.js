import React from "react";

export default function Navbar() {
  return (
    <div className="ml-64 h-16 bg-white shadow-sm flex items-center justify-between px-6">
      <input
        type="text"
        placeholder="Search orders..."
        className="border px-3 py-2 rounded-lg w-64 text-sm"
      />

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <span className="font-semibold">Admin</span>
      </div>
    </div>
  );
}
