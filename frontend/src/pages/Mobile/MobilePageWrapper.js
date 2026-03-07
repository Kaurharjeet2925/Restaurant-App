import React, { useState } from "react";
import MobileHeader from "../../components/Mobile/MobileHeader";
import Sidebar from "../../components/Sidebar";
import MobileTopTabs from "../../components/Mobile/MobileTopbar";

export default function MobilePageWrapper({ children, showTabs = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex w-screen overflow-x-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* IMPORTANT */}
      <div className="flex-1 flex flex-col w-full min-w-full">

        <div className="sticky top-0 z-50 bg-white w-full">
          <MobileHeader
            onHamburgerClick={() => setSidebarOpen((open) => !open)}
          />

          {showTabs && (
            <div className="px-3 pb-2 w-full">
              <MobileTopTabs />
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto pb-4 w-full bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
