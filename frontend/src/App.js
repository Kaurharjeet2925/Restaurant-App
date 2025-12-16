import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/CategoryManagement/Categories";
import MenuItems from "./pages/MenuItemManaement/MenuItems";
import Customers from "./pages/CategoryManagement/Customers/Customers";
import Tables from "./pages/Tables/Tables";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// 🔒 Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

// Layout for admin pages
const AdminLayout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1 ml-[240px]">
      <Navbar />
      {children}
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Dashboard */}
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

        {/* Categories */}
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

        {/* Menu Items */}
        <Route
          path="/menu-items"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <MenuItems />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Customers */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Customers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Tables ✅ */}
        <Route
          path="/tables"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Tables/>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
