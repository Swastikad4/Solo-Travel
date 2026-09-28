import React from "react";

const ConfirmModal = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onCancel}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: "1rem"
      }}
    >
      <div
        className="modal-content-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111827",
          border: `1px solid ${isDanger ? "rgba(239, 68, 68, 0.4)" : "#374151"}`,
          borderRadius: "16px",
          padding: "1.5rem",
          maxWidth: "460px",
          width: "100%",
          color: "#fff",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <span style={{ fontSize: "1.5rem" }}>{isDanger ? "⚠️" : "❓"}</span>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{title}</h3>
        </div>

        <p style={{ color: "#9ca3af", fontSize: "0.92rem", lineHeight: 1.5, margin: "0 0 1.5rem" }}>
          {message}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onCancel}
            style={{ padding: "8px 18px", fontSize: "0.88rem" }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              background: isDanger ? "#ef4444" : "var(--accent, #c9a96e)",
              color: isDanger ? "#fff" : "#121212",
              border: "none",
              borderRadius: "999px",
              padding: "8px 20px",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer"
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
