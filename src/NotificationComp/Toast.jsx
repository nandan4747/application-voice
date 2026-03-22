import React, { useEffect, useState } from "react";
import styles from "./Toast.module.css";

const Toast = ({ message, type = "success", onClose }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start the exit animation slightly before the 3s mark
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2700);

    // Completely remove the component after 3s
    const removeTimer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${isFading ? styles.fadeOut : styles.fadeIn}`}
    >
      <div className={styles.icon}>{type === "success" ? "✓" : "✕"}</div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default Toast;
