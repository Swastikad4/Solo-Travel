import React from "react";
import { Link } from "react-router-dom";

const EmptyState = ({
  icon = "🎒",
  title = "Nothing Found",
  description = "No items available to display right now.",
  actionText = "",
  actionLink = "",
  onAction = null
}) => {
  return (
    <div
      className="empty-state-card"
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: "16px",
        padding: "3rem 1.5rem",
        textAlign: "center",
        maxWidth: "540px",
        margin: "2rem auto"
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "12px" }}>{icon}</div>
      <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.3rem", margin: "0 0 8px" }}>{title}</h3>
      <p style={{ color: "#9ca3af", fontSize: "0.92rem", lineHeight: 1.5, margin: "0 0 1.5rem" }}>
        {description}
      </p>

      {actionText && (
        <div>
          {actionLink ? (
            <Link
              to={actionLink}
              className="btn-create-trip-cta"
              style={{ display: "inline-block", textDecoration: "none", padding: "10px 24px" }}
            >
              {actionText}
            </Link>
          ) : onAction ? (
            <button
              onClick={onAction}
              className="btn-create-trip-cta"
              style={{ padding: "10px 24px" }}
            >
              {actionText}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
