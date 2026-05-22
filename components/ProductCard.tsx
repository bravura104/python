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
      <div className="product-card-wrap rounded-2xl overflow-hidden h-full d-flex flex-column"
        style={{ border: "1px solid #e9ecef", background: "#fff" }}>

        {/* Product visual */}
        <div className="position-relative overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.name}
            bgColor={bgColor}
            className="h-52"
            emojiSize="text-8xl"
          />

          {/* Bottom gradient fade */}
          <div aria-hidden className="position-absolute bottom-0 start-0 w-100"
            style={{ height: 60, background: "linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 100%)", pointerEvents: "none" }} />

          {/* Badge (top-right) */}
          {product.badge && (
            <span className="position-absolute top-0 end-0 m-3 text-white px-2 py-1 rounded-pill fw-semibold"
              style={{ background: brandColor, fontSize: ".7rem", boxShadow: `0 2px 10px ${brandColor}55` }}>
              {product.badge}
            </span>
          )}

          {/* Brand tag (top-left) */}
          {product.brand && (
            <span
              className="position-absolute top-0 start-0 m-3 text-white px-2 py-1 rounded-pill fw-bold"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", fontSize: ".7rem" }}
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

          <p className="mb-2" style={{ color: "#64748b", fontSize: ".8rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.description}
          </p>

          {/* Size chips */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="d-flex flex-wrap gap-1 mb-1 flex-grow-1 align-content-end">
              {product.sizes.slice(0, 7).map((s) => (
                <span key={s} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: ".62rem", color: "#475569", fontWeight: 600, padding: "1px 5px", lineHeight: 1.6 }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 d-flex align-items-center justify-content-between">
            <span className="fw-bold text-gray-900" style={{ fontSize: "1.15rem" }}>
              ${product.price.toFixed(2)}
            </span>

            {/* Color swatches */}
            <div className="d-flex align-items-center gap-1">
              {visibleColors.map((c) => (
                <div
                  key={c.name}
                  className="rounded-circle"
                  style={{ width: 18, height: 18, backgroundColor: c.hex, flexShrink: 0, border: "2px solid #fff", boxShadow: "0 0 0 1.5px #d1d5db" }}
                  title={c.name}
                />
              ))}
              {extraColors > 0 && (
                <span className="rounded-pill" style={{ background: "#f1f5f9", color: "#64748b", fontSize: ".68rem", fontWeight: 700, padding: "0 5px", lineHeight: "18px", display: "inline-block" }}>
                  +{extraColors}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <span
              className="product-cta d-block w-100 text-center text-white fw-semibold py-2 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
                fontSize: ".85rem",
                letterSpacing: ".03em",
                boxShadow: `0 3px 14px ${brandColor}44`,
                transition: "filter .18s",
              }}
            >
              View &amp; Buy →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
