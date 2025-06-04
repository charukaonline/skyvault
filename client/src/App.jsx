import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";
import Layout from "./components/layout/Layout";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import NotFound404 from "./pages/NotFound404";
import AuthenticatedUser from "./components/AuthenticatedUser";
import ProtectedRoutes from "./components/ProtectedRoutes";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageCreators from "./pages/admin/ManageCreators";
import Content from "./pages/Content";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <Layout>
                <LandingPage />
              </Layout>
            }
          />

          <Route
            path="/content"
            element={
              <Layout>
                <Content />
              </Layout>
            }
          />

          {/* Authentication Routes - Redirect if already logged in */}
          <Route
            path="/auth/signup"
            element={
              <AuthenticatedUser>
                <Layout>
                  <Signup />
                </Layout>
              </AuthenticatedUser>
            }
          />
          <Route
            path="/auth/login"
            element={
              <AuthenticatedUser>
                <Layout>
                  <Login />
                </Layout>
              </AuthenticatedUser>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/buyer/:userId/:email"
            element={
              <ProtectedRoutes allowedRoles={["buyer"]}>
                <BuyerDashboard />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/creator/:userId/:email"
            element={
              <ProtectedRoutes allowedRoles={["creator"]}>
                <CreatorDashboard />
              </ProtectedRoutes>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/:userId/:email"
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/admin/creators"
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <ManageCreators />
              </ProtectedRoutes>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
