import React, { useEffect, useState } from "react";

export default function PageHeader({
  title,
  subtitle,
  icon,
  backButton,
  onBack,
  actionButton,
}) {
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
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 transition-all
        ${isMobile
          ? "bg-primaryLight text-primaryDark mt-[78px] shadow-sm mb-4"
          : "bg-transparent text-gray-800"
        }`}
    >
      <div className="flex items-center gap-3">
        {/* BACK BUTTON */}
        {backButton && (
          <button
            onClick={onBack}
            className={`p-2 rounded-full transition-colors ${isMobile ? "hover:bg-white/20 text-primary" : "hover:bg-gray-200 text-gray-600"
              }`}
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* ICON & TEXT */}
        <div className="flex items-center gap-3">
          {icon && <span className={`text-3xl sm:text-4xl text-primary`}>{icon}</span>}
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-primary `}>
              {title}
            </h1>
            {subtitle && (
              <p className={`text-sm sm:text-base mt-0.5 font-medium ${isMobile ? "text-primary" : "text-gray-500"}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ACTION BUTTON */}
      {actionButton && (
        <div className="flex sm:justify-end">
          {actionButton}
        </div>
      )}
    </div>
  );
}
