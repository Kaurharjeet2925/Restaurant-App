import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tables from "./pages/Tables/Tables";
import OrderPage from "./pages/Order/OrderPage";
import CounterPOS from "./pages/Order/CouterPOS";

import MobileHome from "./pages/Mobile/MobileHome";
import MobileTables from "./pages/Mobile/MobileTables";
import MobilePOS from "./pages/Mobile/MobilePOS";
import MobileOrderPage from "./pages/Mobile/MobileOrderPage";
import MobilePageWrapper from "./pages/Mobile/MobilePageWrapper";

import Categories from "./pages/CategoryManagement/Categories";
import MenuItems from "./pages/MenuItemManaement/MenuItems";
import Customers from "./pages/CategoryManagement/Customers/Customers";
import CustomerLedger from "./pages/CategoryManagement/Customers/CustomerLedger";
import KitchenDashboard from "./pages/Kitchen/KitchenDashboard";
import Settings from "./pages/settings/Settings";
import AddUser from "./pages/settings/User/AddUser";
import DailyOrderWiseReport from "./pages/Reports/DailyOrderWiseReport";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useResponsive } from "./hooks/usResponsive";

/* =========================
   🔒 Protected Route
========================= */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

/* =========================
   🧱 Desktop Layout
========================= */
const AdminLayout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1 min-h-screen ">
      <Navbar />
      {children}
    </div>
  </div>
);

/* =========================
   📱 / 💻 Responsive Layout Wrapper
========================= */
const ResponsiveLayout = ({ mobile, desktop }) => {
  const { isMobile } = useResponsive();
  return isMobile ? mobile : desktop;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* 🔐 LOGIN */}
          <Route path="/" element={<Login />} />


          {/* =========================
              🏠 HOME / DASHBOARD (NESTED FOR MOBILE)
          ========================= */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={<MobileHome />}
                  desktop={
                    <AdminLayout>
                      <Dashboard />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          >
            {/* Mobile child routes */}
            <Route index element={<MobileTables />} />
            <Route path="orders" element={<MobileOrderPage />} />
            <Route path="counter-pos" element={<MobilePOS />} />
          </Route>

          {/* Standalone /tables for desktop direct access */}
          <Route
            path="/tables"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={<MobilePageWrapper showTabs={true}><MobileTables /></MobilePageWrapper>}
                  desktop={
                    <AdminLayout>
                      <Tables />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          />

          {/* Standalone /orders for desktop direct access */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={<MobilePageWrapper><MobileOrderPage /></MobilePageWrapper>}
                  desktop={
                    <AdminLayout>
                      <OrderPage />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          />

          {/* Standalone /counter-pos for desktop direct access */}
          <Route
            path="/counter-pos"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={<MobilePageWrapper showTabs={true}><MobilePOS /></MobilePageWrapper>}
                  desktop={
                    <AdminLayout>
                      <CounterPOS />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          />

          {/* =========================
              📦 OTHER RESPONSIVE PAGES
          ========================= */}
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={
                    <MobilePageWrapper>
                      <Categories />
                    </MobilePageWrapper>
                  }
                  desktop={
                    <AdminLayout>
                      <Categories />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/menu-items"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={
                    <MobilePageWrapper>
                      <MenuItems />
                    </MobilePageWrapper>
                  }
                  desktop={
                    <AdminLayout>
                      <MenuItems />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={
                    <MobilePageWrapper>
                      <Customers />
                    </MobilePageWrapper>
                  }
                  desktop={
                    <AdminLayout>
                      <Customers />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers/ledger/:id"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={
                    <MobilePageWrapper>
                      <CustomerLedger />
                    </MobilePageWrapper>
                  }
                  desktop={
                    <AdminLayout>
                      <CustomerLedger />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          />

          {/* =========================
              FULLY RESPONSIVE ROUTES
          ========================= */}
          <Route
            path="/kitchen"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={
                    <MobilePageWrapper>
                      <KitchenDashboard />
                    </MobilePageWrapper>
                  }
                  desktop={
                    <AdminLayout>
                      <KitchenDashboard />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={
                    <MobilePageWrapper>
                      <Settings />
                    </MobilePageWrapper>
                  }
                  desktop={
                    <AdminLayout>
                      <Settings />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/users/add"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={
                    <MobilePageWrapper>
                      <AddUser />
                    </MobilePageWrapper>
                  }
                  desktop={
                    <AdminLayout>
                      <AddUser />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/users/edit/:id"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={
                    <MobilePageWrapper>
                      <AddUser />
                    </MobilePageWrapper>
                  }
                  desktop={
                    <AdminLayout>
                      <AddUser />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ResponsiveLayout
                  mobile={
                    <MobilePageWrapper>
                      <DailyOrderWiseReport />
                    </MobilePageWrapper>
                  }
                  desktop={
                    <AdminLayout>
                      <DailyOrderWiseReport />
                    </AdminLayout>
                  }
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}

export default App;
