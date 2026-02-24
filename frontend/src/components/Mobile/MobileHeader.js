import React from "react";

export default function MobileHeader({ onHamburgerClick }) {
  return (
    <div className="bg-[#ff4d4d] w-full sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">

        {/* Hamburger */}
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

        {/* Title */}
        <h1 className="text-xl font-bold text-white tracking-wide">
          Restro POS
        </h1>

        {/* Spacer to balance hamburger */}
        <div className="w-8" />
      </div>
    </div>
  );
}
