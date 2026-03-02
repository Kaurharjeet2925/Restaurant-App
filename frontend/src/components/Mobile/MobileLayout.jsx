import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import MobileTopTabs from "../components/Mobile/MobileTopbar";
import { Menu } from "lucide-react";

export default function MobileLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">

      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col">

        {/* HEADER – common for ALL mobile pages */}
        <div className="sticky top-0 z-50 bg-white border-b px-4 py-3">

          <div className="flex items-center justify-between">
            <button
              className="md:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-[#ff4d4d]">
                Restro POS
              </h1>
              <p className="text-xs text-gray-500">
                Select order type
              </p>
            </div>

            <div className="w-6" />
          </div>

          <MobileTopTabs />
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
