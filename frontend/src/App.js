import React from "react";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Sidebar />
      <Navbar />
      <Dashboard />
    </>
  );
}

export default App;
