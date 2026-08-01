import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../NotificationComp/Toast";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Function to summon a new toast
  const addNotification = useCallback((message, type = "success") => {
    // Generate a unique ID so React doesn't lose its mind trying to track them
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
  }, []);

  // Function to murder a toast when its time is up
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}

      {/* The VIP Lounge where all your toasts hang out */}
      <div
        className="toast-container"
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",

          gap: "12px",
          pointerEvents: "none",
        }}
      >
        {notifications.map((notif) => (
          <div key={notif.id} style={{ pointerEvents: "auto" }}>
            <Toast
              message={notif.message}
              type={notif.type}
              onClose={() => removeNotification(notif.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Custom hook so you can spam toasts from anywhere
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider. (Seriously, wrap your app!)",
    );
  }
  return context;
};
