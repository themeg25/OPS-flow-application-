import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import {
  ToastProvider,
} from "./context/ToastContext";

import {
  NotificationProvider,
} from "./context/NotificationContext";

import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import DeploymentRequests from "./pages/DeploymentRequests";
import DeploymentDetail from "./pages/DeploymentDetail";

import AccessRequests from "./pages/AccessRequests";
import AccessDetail from "./pages/AccessDetail";

import IssueTracker from "./pages/IssueTracker";
import IssueDetail from "./pages/IssueDetail";

import ProductionIssues from "./pages/ProductionIssues";
import ProductionIssueDetail from "./pages/ProductionIssueDetail";

import UserManagement from "./pages/UserManagement";
import Profile from "./pages/Profile";


/* =========================================================
   PROTECTED ROUTE
   ========================================================= */

function ProtectedRoute({
  children,
  adminOnly = false,
  devOpsOnly = false,
}) {
  const {
    user,
    loading,
    isAdmin,
  } = useAuth();

  /* Authentication is still loading */
  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-content">
          <div className="app-loading-spinner" />
          <p>Loading OPSFlow...</p>
        </div>
      </div>
    );
  }

  /* User is not logged in */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* Admin-only page */
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  /* DevOps-only page */
  if (devOpsOnly && user.role !== "DevOps") {
    return <Navigate to="/" replace />;
  }

  return children;
}


/* =========================================================
   APPLICATION ROUTES
   ========================================================= */

function AppRoutes() {
  return (
    <Routes>

      {/* ===================================================
          LOGIN
          =================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* ===================================================
          PROTECTED APPLICATION
          =================================================== */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* =================================================
            DASHBOARD
            ================================================= */}

        <Route
          index
          element={<Dashboard />}
        />


        {/* =================================================
            DEPLOYMENTS
            ================================================= */}

        <Route
          path="deployments"
          element={<DeploymentRequests />}
        />

        <Route
          path="deployments/:id"
          element={<DeploymentDetail />}
        />


        {/* =================================================
            ACCESS REQUESTS
            ================================================= */}

        <Route
          path="access"
          element={<AccessRequests />}
        />

        <Route
          path="access/:id"
          element={<AccessDetail />}
        />


        {/* =================================================
            ISSUE TRACKER
            ================================================= */}

        <Route
          path="issues"
          element={<IssueTracker />}
        />

        <Route
          path="issues/:id"
          element={<IssueDetail />}
        />


        {/* =================================================
            PRODUCTION ISSUES
            DEVOPS + DEVOPS ADMIN ONLY
            ================================================= */}

        <Route
          path="production"
          element={
            <ProtectedRoute devOpsOnly>
              <ProductionIssues />
            </ProtectedRoute>
          }
        />

        <Route
          path="production/:id"
          element={
            <ProtectedRoute devOpsOnly>
              <ProductionIssueDetail />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PROFILE
            ================================================= */}

        <Route
          path="profile"
          element={<Profile />}
        />


        {/* =================================================
            USER MANAGEMENT
            ADMIN ONLY
            ================================================= */}

        <Route
          path="users"
          element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          }
        />

      </Route>


      {/* ===================================================
          UNKNOWN ROUTES
          =================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}


/* =========================================================
   APP
   ========================================================= */

export default function App() {
  return (
    <BrowserRouter>

      <ToastProvider>

        <AuthProvider>

          <NotificationProvider>

            <AppRoutes />

          </NotificationProvider>

        </AuthProvider>

      </ToastProvider>

    </BrowserRouter>
  );
}