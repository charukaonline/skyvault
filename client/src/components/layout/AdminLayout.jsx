import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  Users,
  Camera,
  ShoppingCart,
  DollarSign,
  Settings,
  LogOut,
  BarChart3,
  FileText,
  Shield,
  Menu,
  X,
  Home,
} from "lucide-react";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showSuccess("Logged Out", "You have been successfully logged out.");
    navigate("/auth/login");
  };

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/admin/dashboard",
      active: location.pathname === "/admin/dashboard",
    },
    {
      icon: Users,
      label: "Manage Creators",
      path: "/admin/creators",
      active: location.pathname === "/admin/creators",
    },
    {
      icon: Camera,
      label: "Content",
      path: "/admin/content",
      active: location.pathname === "/admin/content",
    },
    {
      icon: ShoppingCart,
      label: "Orders",
      path: "/admin/orders",
      active: location.pathname === "/admin/orders",
    },
    {
      icon: DollarSign,
      label: "Revenue",
      path: "/admin/revenue",
      active: location.pathname === "/admin/revenue",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      path: "/admin/analytics",
      active: location.pathname === "/admin/analytics",
    },
    {
      icon: FileText,
      label: "Reports",
      path: "/admin/reports",
      active: location.pathname === "/admin/reports",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/admin/settings",
      active: location.pathname === "/admin/settings",
    },
  ];

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">SkyVault Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-slate-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-2 mt-1 text-sm rounded-lg transition-colors ${
                item.active
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-700">
          <div className="mb-3 px-3 py-2">
            <p className="text-sm font-medium text-white">{currentUser.name}</p>
            <p className="text-xs text-gray-400">{currentUser.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-0">
        {/* Top Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-slate-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-300">Admin Panel</p>
              <p className="text-xs text-gray-400">Manage your platform</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-900">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
