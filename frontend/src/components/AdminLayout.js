import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const AdminLayout = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={open} setOpen={setOpen} />

      {/* IMPORTANT FIXES HERE */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar setOpen={setOpen} />

        {/* Allow both horizontal & vertical scroll */}
        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;