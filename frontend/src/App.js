import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/CategoryManagement/Categories";
//import MenuItems from "./pages/MenuItems/MenuItems";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// 🔒 Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />; // redirect to login
  }

  return children; // allow access
};

// 🧩 Layout for authenticated pages (Dashboard pages)
const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-[240px]">
        <Navbar />
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      <Route
  path="/categories"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <Categories />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

{/* <Route
  path="/menu-items"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <MenuItems />
      </AdminLayout>
    </ProtectedRoute>
  }
/> */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
