import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Camera,
  Upload,
  DollarSign,
  BarChart3,
  Package,
  Settings,
  FileVideo,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Eye,
  Download,
} from "lucide-react";

const CreatorSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("dashboard");

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      path: "/creator/dashboard",
      description: "Overview & Analytics",
    },
    {
      id: "upload",
      label: "Upload Content",
      icon: Upload,
      path: "/creator/upload",
      description: "Add new drone footage",
    },
    {
      id: "content",
      label: "My Content",
      icon: FileVideo,
      path: "/creator/content",
      description: "Manage uploaded media",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingBag,
      path: "/creator/orders",
      description: "View & approve purchases",
    },
    {
      id: "earnings",
      label: "Earnings",
      icon: DollarSign,
      path: "/creator/earnings",
      description: "Revenue & payouts",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      path: "/creator/analytics",
      description: "Views & engagement",
    },
  ];

  const handleItemClick = (item) => {
    setActiveItem(item.id);

    // Get current user info from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Navigate to the correct path based on item
    switch (item.id) {
      case "dashboard":
        navigate(`/creator/${user.id}/${user.email}`);
        break;
      case "upload":
        navigate("/creator/upload");
        break;
      case "content":
        navigate("/creator/content");
        break;
      default:
        navigate(item.path);
        break;
    }
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 shadow-xl z-40">
      <div className="flex flex-col h-full">
        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 border border-blue-500/30"
                    : "text-gray-400 hover:bg-slate-700 hover:text-gray-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-blue-400"
                      : "text-gray-500 group-hover:text-gray-300"
                  }`}
                />
                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      isActive ? "text-blue-300" : "text-gray-200"
                    }`}
                  >
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-slate-700">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-200 mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Total Views</span>
                </div>
                <span className="text-sm font-medium text-gray-200">12.5K</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Downloads</span>
                </div>
                <span className="text-sm font-medium text-gray-200">342</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">This Month</span>
                </div>
                <span className="text-sm font-medium text-gray-200">
                  $1,247
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CreatorSideBar;
