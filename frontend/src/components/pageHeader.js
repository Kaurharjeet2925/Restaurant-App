import React, { useEffect, useState } from "react";

export default function PageHeader({ title, icon, backButton, onBack }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b mb-3
        ${
          isMobile
            ? "bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 text-white"
            : "bg-white"
        }`}
    >
      {/* BACK BUTTON */}
      {backButton && isMobile && (
        <button
          onClick={onBack}
          className="hover:opacity-80"
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            stroke="currentColor"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
      )}

      {/* ICON */}
      {icon && <span className="text-2xl">{icon}</span>}

      {/* TITLE */}
      <h2
        className={`font-bold ${
          isMobile ? "text-xl text-white" : "text-4xl text-gray-800"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}