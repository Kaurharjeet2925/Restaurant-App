import React from "react";
import KitchenDashboard from "../pages/Kitchen/KitchenDashboard";
import MobileHeader from "./Mobile/MobileHeader"; // adjust path if needed
import Navbar from "./Navbar";
import { useResponsive } from "../hooks/usResponsive";

export default function KitchenLayout() {
  const { isMobile } = useResponsive();

  return (
<div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* Header */}
      {isMobile ? (
        <MobileHeader />   // mobile header
      ) : (
        <Navbar />         // desktop navbar
      )}

      {/* Kitchen Screen */}
      <div className="flex-1 overflow-auto">
        <KitchenDashboard />
      </div>

    </div>
  );
}