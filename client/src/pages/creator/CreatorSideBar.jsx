import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Camera,
  Upload,
  DollarSign,
  Users,
  LogOut,
  FileVideo,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const CreatorSideBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="fixed inset-0 md:relative md:flex md:flex-col md:w-64 bg-slate-900 text-white p-4">
      {/* Logo and Brand */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold">SkyVault</h2>
        <Button
          variant="outline"
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav
        className={`flex-1 space-y-2 md:space-y-4 transition-all duration-300 ${
          open ? "max-h-screen" : "max-h-0 overflow-hidden"
        }`}
      >
        <a
          href="/creator"
          className={`flex items-center px-4 py-2 rounded transition-colors ${
            isActive("/creator")
              ? "bg-slate-800 text-white"
              : "text-gray-300 hover:bg-slate-700"
          }`}
        >
          <Camera className="h-5 w-5 mr-2" />
          Dashboard
        </a>

        <a
          href="/creator/upload"
          className={`flex items-center px-4 py-2 rounded transition-colors ${
            isActive("/creator/upload")
              ? "bg-slate-800 text-white"
              : "text-gray-300 hover:bg-slate-700"
          }`}
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload Content
        </a>

        <a
          href="/creator/content"
          className={`flex items-center px-4 py-2 rounded transition-colors ${
            isActive("/creator/content")
              ? "bg-slate-800 text-white"
              : "text-gray-300 hover:bg-slate-700"
          }`}
        >
          <FileVideo className="h-5 w-5 mr-2" />
          My Content
        </a>

        <a
          href="/creator/orders"
          className={`flex items-center px-4 py-2 rounded transition-colors ${
            isActive("/creator/orders")
              ? "bg-slate-800 text-white"
              : "text-gray-300 hover:bg-slate-700"
          }`}
        >
          <Users className="h-5 w-5 mr-2" />
          Orders
        </a>

        <div className="border-t border-slate-700 pt-4 mt-4">
          <a
            href="/"
            className="flex items-center px-4 py-2 text-gray-300 hover:bg-slate-700 rounded transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </a>
        </div>
      </nav>
    </div>
  );
};

export default CreatorSideBar;
