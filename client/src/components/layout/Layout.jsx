import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import ExploreContent from "@/pages/ExploreContent";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      <main className="flex-grow">
        {/* Render children if provided, otherwise render Outlet for nested routes */}
        {children ? children : <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
