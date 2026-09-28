import React from "react";
import { useToast } from "../context/ToastContext";

const ICONS = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️"
};

const BORDER_COLORS = {
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6"
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="toast-container-root"
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "380px",
        width: "calc(100% - 48px)",
        pointerEvents: "none"
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-pill-card"
          style={{
            pointerEvents: "auto",
            background: "rgba(17, 24, 39, 0.95)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${BORDER_COLORS[toast.type] || "#374151"}`,
            borderLeft: `4px solid ${BORDER_COLORS[toast.type] || "#3b82f6"}`,
            borderRadius: "12px",
            padding: "12px 16px",
            color: "#fff",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{ICONS[toast.type] || "ℹ️"}</span>
            <div style={{ fontSize: "0.88rem", fontWeight: 500, color: "#f3f4f6", lineHeight: 1.4 }}>
              {toast.message}
            </div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              fontSize: "1.1rem",
              cursor: "pointer",
              padding: "2px 6px",
              lineHeight: 1,
              flexShrink: 0
            }}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
