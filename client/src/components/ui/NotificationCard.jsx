import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const NotificationCard = ({ notification, onClose }) => {
  const { id, type, title, message } = notification;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-green-500";
      case "error":
        return "border-red-500";
      case "warning":
        return "border-yellow-500";
      default:
        return "border-blue-500";
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-900/20";
      case "error":
        return "bg-red-900/20";
      case "warning":
        return "bg-yellow-900/20";
      default:
        return "bg-blue-900/20";
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 200);
  };

  return (
    <div
      className={`
        ${getBorderColor()} ${getBackgroundColor()}
        bg-slate-800 border-l-4 rounded-md shadow-lg p-4 
        backdrop-blur-sm transition-all duration-300 ease-out
        ${
          isVisible
            ? "transform translate-x-0 opacity-100"
            : "transform translate-x-full opacity-0"
        }
      `}
      style={{
        boxShadow:
          "0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
          )}
          <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-200 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-slate-500 rounded-sm p-1 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
