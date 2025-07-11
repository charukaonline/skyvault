import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";
import { CartProvider } from "./contexts/CartContext";
import Layout from "./components/layout/Layout";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import NotFound404 from "./pages/NotFound404";
import AuthenticatedUser from "./components/AuthenticatedUser";
import ProtectedRoutes from "./components/ProtectedRoutes";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageCreators from "./pages/admin/ManageCreators";
import Content from "./pages/Content";
import UploadContent from "./pages/creator/UploadContent";
import ContentManagement from "./pages/creator/ContentManagement";
import ExploreContent from "./pages/ExploreContent";
import ModerateContent from "./pages/admin/ModerateContent";
import Orders from "./pages/creator/Orders";

function App() {
  return (
    <NotificationProvider>
      <CartProvider>
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

            {/* Add ExploreContent as a child route of Layout */}
            <Route
              path="/explore"
              element={
                <Layout>
                  <ExploreContent />
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

            {/* Creator Routes */}
            <Route
              path="/creator/upload"
              element={
                <ProtectedRoutes allowedRoles={["creator"]}>
                  <UploadContent />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/creator/content"
              element={
                <ProtectedRoutes allowedRoles={["creator"]}>
                  <ContentManagement />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/creator/orders"
              element={
                <ProtectedRoutes allowedRoles={["creator"]}>
                  <Orders />
                </ProtectedRoutes>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
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

            <Route
              path="/admin/content"
              element={
                <ProtectedRoutes allowedRoles={["admin"]}>
                  <ModerateContent />
                </ProtectedRoutes>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<NotFound404 />} />
          </Routes>
        </Router>
      </CartProvider>
    </NotificationProvider>
  );
}

export default App;
