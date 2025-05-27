import React, { createContext, useContext, useState } from "react";
import NotificationContainer from "../components/ui/NotificationContainer";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = { id, ...notification };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);

    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const showSuccess = (title, message) => {
    return addNotification({ type: "success", title, message });
  };

  const showError = (title, message) => {
    return addNotification({ type: "error", title, message });
  };

  const showWarning = (title, message) => {
    return addNotification({ type: "warning", title, message });
  };

  const showInfo = (title, message) => {
    return addNotification({ type: "info", title, message });
  };

  return (
    <NotificationContext.Provider
      value={{
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};
