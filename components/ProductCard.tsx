import Link from "next/link";
import type { Product } from "@/lib/types";
import ProductImage from "@/components/ProductImage";

// Brand accent colors – matches page.tsx BRANDS array
const BRAND_COLORS: Record<string, string> = {
  "Pro Club": "#1a1a2e",
  "Shaka":    "#0369a1",
  "AAA":      "#dc2626",
};

export default function ProductCard({ product }: { product: Product }) {
  const bgColor    = product.colors[0]?.hex ?? "#e5e7eb";
  const brandColor = product.brand ? (BRAND_COLORS[product.brand] ?? "#111827") : "#111827";

  // Show first 5 swatches; if more, show a "+N" pill
  const MAX_SWATCHES  = 5;
  const visibleColors = product.colors.slice(0, MAX_SWATCHES);
  const extraColors   = product.colors.length - MAX_SWATCHES;

  return (
    <Link href={`/products/${product.id}`} className="group block h-full text-decoration-none">
      <div className="rounded-2xl overflow-hidden border border-gray-200 group-hover:border-gray-400 group-hover:shadow-xl transition-all duration-200 h-full d-flex flex-column">

        {/* Product visual */}
        <div className="position-relative">
          <ProductImage
            src={product.image}
            alt={product.name}
            bgColor={bgColor}
            className="h-48"
            emojiSize="text-8xl"
          />

          {/* Badge (top-right) */}
          {product.badge && (
            <span className="position-absolute top-0 end-0 m-3 text-white text-xs px-2 py-1 rounded-pill fw-semibold"
              style={{ background: brandColor, fontSize: ".72rem" }}>
              {product.badge}
            </span>
          )}

          {/* Brand tag (top-left) */}
          {product.brand && (
            <span
              className="position-absolute top-0 start-0 m-3 text-white text-xs px-2 py-1 rounded-pill fw-bold"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", fontSize: ".72rem" }}
            >
              {product.brand}
            </span>
          )}
        </div>

        {/* Product info */}
        <div className="p-4 bg-white d-flex flex-column flex-grow-1">

          {/* Category */}
          {product.category && (
            <span className="text-xs fw-medium mb-1" style={{ color: "#94a3b8", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {product.category}
            </span>
          )}

          <h3 className="fw-semibold text-gray-900 mb-1 leading-snug" style={{ fontSize: "1rem" }}>
            {product.name}
          </h3>

          <p className="text-gray-500 mb-0 flex-grow-1" style={{ fontSize: ".82rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.description}
          </p>

          <div className="mt-3 d-flex align-items-center justify-content-between">
            <span className="fw-bold text-gray-900" style={{ fontSize: "1.15rem" }}>
              ${product.price.toFixed(2)}
            </span>

            {/* Color swatches */}
            <div className="d-flex align-items-center gap-1">
              {visibleColors.map((c) => (
                <div
                  key={c.name}
                  className="rounded-circle border border-gray-200 shadow-sm"
                  style={{ width: 16, height: 16, backgroundColor: c.hex, flexShrink: 0 }}
                  title={c.name}
                />
              ))}
              {extraColors > 0 && (
                <span className="rounded-pill px-1" style={{ background: "#f1f5f9", color: "#64748b", fontSize: ".7rem", fontWeight: 600 }}>
                  +{extraColors}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <span
              className="d-block w-100 text-center text-white fw-semibold py-2 rounded-xl"
              style={{ background: brandColor, fontSize: ".85rem", transition: "opacity .15s" }}
            >
              View &amp; Buy →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
