import styles from "./alert_stylsheet.module.css";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { useMusic } from "../MusicContext.jsx";
export const AlertDailog = ({
  message = "Something went terribly wrong.",
  subHeading = "sub heading",
  onConfirm,
  onCancel,
  wanToClosePlaying = true,
}) => {
  const [okbuttonText, setOKButtonText] = useState("OK");
  const { closePlayer } = useMusic();
  useEffect(() => {
    if (wanToClosePlaying) {
      closePlayer();
    }
    okButtonRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const okButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);
  return (
    <div className={styles.main}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.iconBadge}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
              <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" />
              <path d="M8 6v8" />
            </svg>
          </div>
          <h1 className={styles.heading}>Alert</h1>
        </div>
        <h2 className={styles.sub_heading}>{subHeading}</h2>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={`${styles.btn} ${styles.btnCancel}`}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            ref={okButtonRef}
            className={`${styles.btn} ${styles.btnConfirm}`}
            onClick={() => {
              okButtonRef.current.disabled = true;
              cancelButtonRef.current.disabled = true;
              setOKButtonText("Processing...");
              onConfirm();
            }}
          >
            {okbuttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
