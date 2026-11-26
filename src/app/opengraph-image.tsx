import { ImageResponse } from "next/og";

export const alt =
  "IndieShip — Launch your product. Get found every day.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default share image for links to the site
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #7c5cff 0%, #4f46e5 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="52" height="52" viewBox="0 0 32 32">
            <path d="M16.5 6.5v12h8.2zM14.5 9.5v9H9zM6.5 21h19l-2.8 4.5H9.3z" fill="#7c5cff"/>
          </svg>
        </div>
        <div style={{ fontSize: 44, fontWeight: 700 }}>indieship</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
          Launch your product.
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            color: "#fcd34d",
          }}
        >
          Get found every day.
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: 28 }}>
        {[
          "New launches every day",
          "Free launches",
          "Permanent product page",
        ].map((t) => (
          <div
            key={t}
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
            }}
          >
            {t}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
