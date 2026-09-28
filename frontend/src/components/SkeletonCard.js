import React from "react";

const SkeletonCard = ({ count = 3, type = "card" }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === "list") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {items.map((n) => (
          <div
            key={n}
            className="skeleton-box"
            style={{
              height: "72px",
              borderRadius: "12px",
              background: "linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite"
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem", width: "100%" }}>
      {items.map((n) => (
        <div
          key={n}
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: "320px"
          }}
        >
          <div
            className="skeleton-box"
            style={{
              height: "180px",
              background: "linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite"
            }}
          />
          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
            <div
              style={{
                height: "20px",
                width: "60%",
                borderRadius: "6px",
                background: "linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite"
              }}
            />
            <div
              style={{
                height: "14px",
                width: "90%",
                borderRadius: "4px",
                background: "linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite"
              }}
            />
            <div
              style={{
                height: "14px",
                width: "40%",
                borderRadius: "4px",
                marginTop: "auto",
                background: "linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite"
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonCard;
