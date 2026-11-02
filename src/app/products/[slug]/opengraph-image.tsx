import { ImageResponse } from "next/og";
import { allProducts, getProduct } from "@/lib/data";

export const alt = "Product launched on WeekLaunch";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug }));
}

// Share image for each product page
export default async function ProductImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  const name = product?.name ?? "WeekLaunch";
  const tagline = product?.tagline ?? "Launch your product";
  const logo = product?.logo ?? { glyph: "W", from: "#9f85ff", to: "#5a32db" };
  // The image font only has plain letters, so symbol logos fall back to the initial
  const glyph = /^[\w@]+$/.test(logo.glyph) ? logo.glyph : name[0];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#f8f9fc",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: 999,
            border: "4px solid #0f172a",
            background: `linear-gradient(135deg, ${logo.from}, ${logo.to})`,
            color: logo.fg ?? "white",
            fontSize: 72,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {glyph}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 72, fontWeight: 800, color: "#0f172a" }}>
            {name}
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#475569",
              marginTop: 8,
              lineHeight: 1.3,
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "12px 24px",
            borderRadius: 16,
            border: "3px solid #0f172a",
            background: "#fcd34d",
            fontSize: 30,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Launched on WeekLaunch
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, color: "#7c5cff" }}>
          weeklaunch
        </div>
      </div>
    </div>,
    size,
  );
}
