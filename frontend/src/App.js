import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
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
import ActivityLog from "./pages/ActivityLogs";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useResponsive } from "./hooks/usResponsive";
import ViewOrders from "./pages/Order/ViewOrder"
import { NotificationProvider } from "./context/NotificationContext";
import { initSocket } from "./socket/socketClient";

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
const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        {/* ONLY THIS SCROLLS */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};


/* =========================
   📱 / 💻 Responsive Layout Wrapper
========================= */
const ResponsiveLayout = ({ mobile, desktop }) => {
  const { isMobile } = useResponsive();
  return isMobile ? mobile : desktop;
};

function App() {
 
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      initSocket();
    }
  }, []);

  return (
    <>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* 🔐 LOGIN */}
            <Route path="/" element={<Login />} />

            {/* =========================
                🏠 DASHBOARD
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
              <Route index element={<MobileTables />} />
              <Route path="orders" element={<MobileOrderPage />} />
              <Route path="counter-pos" element={<MobilePOS />} />
            </Route>

            <Route
              path="/tables"
              element={
                <ProtectedRoute>
                  <ResponsiveLayout
                    mobile={
                      <MobilePageWrapper showTabs>
                        <MobileTables />
                      </MobilePageWrapper>
                    }
                    desktop={
                      <AdminLayout>
                        <Tables />
                      </AdminLayout>
                    }
                  />
                </ProtectedRoute>
              }
            />
<Route
  path="/activity"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <ActivityLog />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/view-orders"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <ViewOrders />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <ResponsiveLayout
                    mobile={
                      <MobilePageWrapper>
                        <MobileOrderPage />
                      </MobilePageWrapper>
                    }
                    desktop={
                      <AdminLayout>
                        <OrderPage />
                      </AdminLayout>
                    }
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/counter-pos"
              element={
                <ProtectedRoute>
                  <ResponsiveLayout
                    mobile={
                      <MobilePageWrapper showTabs>
                        <MobilePOS />
                      </MobilePageWrapper>
                    }
                    desktop={
                      <AdminLayout>
                        <CounterPOS />
                      </AdminLayout>
                    }
                  />
                </ProtectedRoute>
              }
            />

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
      </NotificationProvider>

      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}

export default App;
