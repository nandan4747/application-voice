import React, { useEffect, useState } from "react";

const Toast = ({ message, type = "success", onClose }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFading(true), 2700);
    const removeTimer = setTimeout(() => onClose(), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes toastIn {
          0% { transform: translateY(-16px) scale(0.96); opacity: 0; }
          60% { transform: translateY(3px) scale(1.005); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        @keyframes toastOut {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-12px) scale(0.95); opacity: 0; }
        }

        @keyframes progressShrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }

        @keyframes iconPop {
          0% { transform: scale(0) rotate(-15deg); opacity: 0; }
          70% { transform: scale(1.15) rotate(4deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .toast-root {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          font-family: 'DM Sans', sans-serif;
          animation: ${isFading ? "toastOut 0.28s cubic-bezier(0.4,0,1,1) forwards" : "toastIn 0.42s cubic-bezier(0.16,1,0.3,1) forwards"};
        }

        .toast-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 18px 14px 16px;
          min-width: 300px;
          max-width: 400px;
          background: ${
            isSuccess
              ? "linear-gradient(135deg, #0f1f17 0%, #0d1d15 100%)"
              : "linear-gradient(135deg, #1f0f0f 0%, #1a0d0d 100%)"
          };
          border: 1px solid ${isSuccess ? "rgba(52,211,153,0.18)" : "rgba(248,113,113,0.18)"};
          border-radius: 14px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 8px 24px rgba(0,0,0,0.5),
            0 2px 8px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.06);
          overflow: hidden;
          position: relative;
        }

        .toast-glow {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: ${
            isSuccess
              ? "radial-gradient(ellipse 60% 40% at 10% 0%, rgba(52,211,153,0.12) 0%, transparent 70%)"
              : "radial-gradient(ellipse 60% 40% at 10% 0%, rgba(248,113,113,0.12) 0%, transparent 70%)"
          };
          pointer-events: none;
        }

        .toast-icon-wrap {
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${
            isSuccess
              ? "linear-gradient(135deg, rgba(52,211,153,0.2), rgba(16,185,129,0.1))"
              : "linear-gradient(135deg, rgba(248,113,113,0.2), rgba(239,68,68,0.1))"
          };
          border: 1px solid ${isSuccess ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"};
          animation: iconPop 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both;
          position: relative;
          z-index: 1;
        }

        .toast-icon {
          width: 14px;
          height: 14px;
          color: ${isSuccess ? "#34d399" : "#f87171"};
        }

        .toast-body {
          flex: 1;
          min-width: 0;
          padding-top: 1px;
          position: relative;
          z-index: 1;
        }

        .toast-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${isSuccess ? "#34d399" : "#f87171"};
          margin: 0 0 3px;
          line-height: 1;
        }

        .toast-message {
          font-size: 14px;
          font-weight: 400;
          line-height: 1.45;
          color: rgba(255,255,255,0.82);
          margin: 0;
          word-break: break-word;
        }

        .toast-close {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s;
          padding: 0;
          margin-top: 2px;
          position: relative;
          z-index: 1;
        }

        .toast-close:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7);
        }

        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: ${
            isSuccess
              ? "linear-gradient(90deg, #059669, #34d399)"
              : "linear-gradient(90deg, #dc2626, #f87171)"
          };
          transform-origin: left;
          animation: progressShrink 3s linear forwards;
          border-radius: 0 0 14px 14px;
          opacity: 0.7;
        }
      `}</style>

      <div className="toast-root" role="alert" aria-live="polite">
        <div className="toast-card">
          <div className="toast-glow" />

          <div className="toast-icon-wrap">
            {isSuccess ? (
              <svg
                className="toast-icon"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="2.5 8.5 6.5 12.5 13.5 4.5" />
              </svg>
            ) : (
              <svg
                className="toast-icon"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            )}
          </div>

          <div className="toast-body">
            <p className="toast-label">{isSuccess ? "Success" : "Error"}</p>
            <p className="toast-message">{message}</p>
          </div>

          <button
            className="toast-close"
            onClick={onClose}
            aria-label="Dismiss"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <line x1="1" y1="1" x2="9" y2="9" />
              <line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>

          <div className="toast-progress" />
        </div>
      </div>
    </>
  );
};
export default Toast;
