import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import MobileHeader from "../../components/Mobile/MobileHeader";
import MobileTopTabs from "../../components/Mobile/MobileTopbar";

export default function MobileHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-white flex min-h-screen w-screen overflow-x-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* IMPORTANT: force full width */}
      <div className="flex-1 flex flex-col w-full min-w-full">

        <div className="sticky top-0 z-50 bg-white shadow-sm w-full">
          <MobileHeader
            onHamburgerClick={() => setSidebarOpen((open) => !open)}
          />

          <div className="px-3 pb-2 w-full">
            <MobileTopTabs />
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-auto px-2 pt-2 w-full bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
