import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon for iPhone and iPad
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #9f85ff, #5a32db)",
      }}
    >
      <svg width="120" height="120" viewBox="0 0 32 32">
        <path d="M16.5 6.5v12h8.2zM14.5 9.5v9H9zM6.5 21h19l-2.8 4.5H9.3z" fill="#fff"/>
      </svg>
    </div>,
    size,
  );
}
