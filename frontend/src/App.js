import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/CategoryManagement/Categories";
import MenuItems from "./pages/MenuItemManaement/MenuItems";
import Customers from "./pages/CategoryManagement/Customers/Customers";
import Tables from "./pages/Tables/Tables";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Settings from "./pages/settings/Settings";
import "react-toastify/dist/ReactToastify.css";
import OrderPage from "./pages/Order/OrderPage";
import KitchenDashboard from "./pages/Kitchen/KitchenDashboard";
import AddUser from "./pages/settings/User/AddUser"; 
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
    <>
    <BrowserRouter>
      <Routes>
        {/* Login */}
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
         <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <OrderPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Kitchen Dashboard */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <KitchenDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
  path="/settings"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <Settings />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/settings/users/add"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <AddUser />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/settings/users/edit/:id"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <AddUser />
      </AdminLayout>
    </ProtectedRoute>
  }
/>


      </Routes>
      
    </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

export default App;
