/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image({
  title = "my short code",
  image = "https://assets.myntassets.com/h_($height),q_($qualityPercentage),w_($width)/v1/assets/images/2024/NOVEMBER/4/je6Rr3sC_b4d47ef7a5bb43a78cb29fadf2bd6f90.jpg",
}: {
  title?: string;
  image?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "60px 40px",
          backgroundImage: "linear-gradient(to bottom, #dbf4ff, #fff1f1)",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        {/* Title at the Top */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: -1.5,
            maxWidth: "90%",
            color: "#000", // Plain black
          }}
        >
          {title}
        </div>

        {/* Center Image */}
        <img
          src={image}
          alt="Open Graph Visual"
          style={{
            maxWidth: "90%",
            maxHeight: "60%",
            objectFit: "contain",
            borderRadius: 16,
            margin: "40px 0",
          }}
        />

        {/* Footer Text */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: "#222",
            opacity: 0.8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Built by</span>
          <span
            style={{
              backgroundImage: "linear-gradient(90deg, #36f53b, #28c840)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Synquic
          </span>
        </div>
      </div>
    )
  );
}
