import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2a78d6",
          color: "white",
          fontSize: 88,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        SP
      </div>
    ),
    { width: 192, height: 192 }
  );
}
