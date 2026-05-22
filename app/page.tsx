import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import NailSpaBooking from "@/components/NailSpaBooking";
import Link from "next/link";

// ── Brand meta – order controls tab order ───────────────────────────────────
const BRANDS: { name: string; color: string; emoji: string }[] = [
  { name: "Pro Club", color: "#1a1a2e", emoji: "💪" },
  { name: "Shaka",    color: "#0369a1", emoji: "🤙" },
  { name: "AAA",      color: "#dc2626", emoji: "⭐" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string }>;
}) {
  const { q, brand } = await searchParams;
  const query       = q?.toLowerCase().trim() ?? "";
  const activeBrand = brand?.trim() ?? "";

  const allProducts = products as Product[];

  // Brand counts for tabs
  const brandCounts = Object.fromEntries(
    BRANDS.map((b) => [b.name, allProducts.filter((p) => p.brand === b.name).length])
  );

  const filtered = allProducts.filter((p) => {
    if (query && !p.name.toLowerCase().includes(query) && !p.description?.toLowerCase().includes(query)) return false;
    if (activeBrand && p.brand !== activeBrand) return false;
    return true;
  });

  // Build filter link (preserves q when present)
  function brandLink(b: string) {
    const params = new URLSearchParams();
    if (b) params.set("brand", b);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="text-white text-center position-relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #1e1b4b 55%, #0a0e1a 100%)", paddingTop: "5rem", paddingBottom: "4.5rem" }}
      >
        {/* Grid pattern */}
        <div aria-hidden className="position-absolute top-0 start-0 w-100 h-100" style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.03) 40px,rgba(255,255,255,.03) 41px)," +
            "repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,.03) 40px,rgba(255,255,255,.03) 41px)",
          pointerEvents: "none",
        }} />

        {/* Glow blob – top-left (purple) */}
        <div aria-hidden className="position-absolute" style={{
          top: -120, left: -120, width: 560, height: 560,
          background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 68%)",
          pointerEvents: "none",
        }} />
        {/* Glow blob – bottom-right (sky) */}
        <div aria-hidden className="position-absolute" style={{
          bottom: -80, right: -80, width: 440, height: 440,
          background: "radial-gradient(circle, rgba(56,189,248,0.16) 0%, transparent 68%)",
          pointerEvents: "none",
        }} />
        {/* Glow blob – center (subtle indigo) */}
        <div aria-hidden className="position-absolute" style={{
          top: "30%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300,
          background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="position-relative px-4" style={{ zIndex: 1 }}>

          {/* Top badge */}
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4"
            style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)", fontSize: ".76rem", color: "#c4b5fd", letterSpacing: ".07em" }}>
            ✨ Premium Blank Tees &nbsp;·&nbsp; Print Ready &nbsp;·&nbsp; Bulk Friendly
          </div>

          <h1 className="fw-black mb-3"
            style={{ fontSize: "clamp(2.8rem, 9vw, 5.5rem)", letterSpacing: "-2px", lineHeight: 1.0 }}>
            DingTee{" "}
            <span style={{ color: "#a78bfa", textShadow: "0 0 60px rgba(167,139,250,0.55), 0 0 20px rgba(167,139,250,0.3)" }}>
              909
            </span>
          </h1>

          <p className="mb-8 mx-auto" style={{ maxWidth: 500, color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.7 }}>
            Quality blanks from{" "}
            <strong style={{ color: "#e2e8f0" }}>Pro Club</strong>,{" "}
            <strong style={{ color: "#e2e8f0" }}>Shaka</strong>, and{" "}
            <strong style={{ color: "#e2e8f0" }}>AAA</strong>{" "}
            — perfect for custom printing, bulk orders, or just a premium everyday tee.
          </p>

          {/* Brand pills */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-10">
            {BRANDS.map((b) => (
              <Link key={b.name} href={brandLink(b.name)} className="text-decoration-none">
                <span
                  className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-semibold"
                  style={{
                    background: activeBrand === b.name ? b.color : "rgba(255,255,255,0.07)",
                    color: "#fff",
                    border: `1.5px solid ${activeBrand === b.name ? b.color : "rgba(255,255,255,0.18)"}`,
                    fontSize: ".88rem",
                    backdropFilter: "blur(8px)",
                    boxShadow: activeBrand === b.name ? `0 0 24px ${b.color}66, 0 4px 16px ${b.color}44` : "none",
                    transition: "all .2s",
                  }}
                >
                  <span>{b.emoji}</span>
                  {b.name}
                  <span className="rounded-pill ms-1 px-2" style={{ background: "rgba(255,255,255,.14)", fontSize: ".72rem" }}>
                    {brandCounts[b.name] ?? 0}
                  </span>
                </span>
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="d-flex flex-wrap justify-content-center gap-5">
            {[
              { icon: "🏷️", value: String(BRANDS.length),   label: "Brands"    },
              { icon: "👕", value: `${allProducts.length}+`, label: "Products"  },
              { icon: "🎨", value: "30+",                    label: "Colors"    },
              { icon: "📐", value: "5XL",                    label: "Max Size"  },
            ].map(({ icon, value, label }) => (
              <div key={label} className="text-center">
                <div style={{ fontSize: "1.4rem", marginBottom: 2 }}>{icon}</div>
                <div className="fw-bold" style={{ color: "#f1f5f9", fontSize: "1.5rem", lineHeight: 1.1 }}>{value}</div>
                <div style={{ color: "#64748b", fontSize: ".75rem", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee belt */}
        <div className="position-absolute bottom-0 start-0 w-100 overflow-hidden" style={{ height: 36 }}>
          <div className="d-flex align-items-center h-100"
            style={{ background: "rgba(139,92,246,0.1)", borderTop: "1px solid rgba(139,92,246,0.22)" }}>
            <div className="marquee-track gap-5 fw-semibold"
              style={{ color: "#a78bfa", fontSize: ".72rem", letterSpacing: ".12em" }}>
              {[...Array(8)].flatMap((_, i) =>
                ["💪 PRO CLUB", "🤙 SHAKA", "⭐ AAA", "🎨 PRINT READY", "📦 BULK ORDERS", "✅ PREMIUM QUALITY"].map((t) => (
                  <span key={`${i}-${t}`} style={{ marginRight: "2.5rem" }}>{t}</span>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefit strip ─────────────────────────────────────────────────── */}
      <div style={{ background: "#f8fafc", borderBottom: "1px solid #e9ecef" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="d-flex flex-wrap justify-content-center gap-4 py-3">
            {([["🚚","Fast Shipping"],["🎨","Print Ready"],["📦","Bulk Friendly"],["📐","XS – 5XL"],["🏆","Top Brands"]] as [string,string][]).map(([icon, text]) => (
              <div key={text} className="d-flex align-items-center gap-2" style={{ color: "#475569", fontSize: ".8rem", fontWeight: 500 }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="bg-white border-bottom sticky-top" style={{ top: 56, zIndex: 9 }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="d-flex align-items-center gap-1 overflow-auto py-2" style={{ scrollbarWidth: "none" }}>
            <Link
              href={brandLink("")}
              className="text-decoration-none flex-shrink-0"
            >
              <span
                className="d-inline-block px-3 py-1 rounded-pill fw-medium"
                style={{
                  background: !activeBrand ? "#0f172a" : "#f1f5f9",
                  color:      !activeBrand ? "#fff"    : "#475569",
                  fontSize: ".85rem",
                  border: "1.5px solid transparent",
                  whiteSpace: "nowrap",
                }}
              >
                All ({allProducts.length})
              </span>
            </Link>

            {BRANDS.map((b) => (
              <Link key={b.name} href={brandLink(b.name)} className="text-decoration-none flex-shrink-0">
                <span
                  className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill fw-medium"
                  style={{
                    background: activeBrand === b.name ? b.color  : "#f1f5f9",
                    color:      activeBrand === b.name ? "#fff"   : "#475569",
                    fontSize: ".85rem",
                    border: "1.5px solid transparent",
                    whiteSpace: "nowrap",
                  }}
                >
                  {b.emoji} {b.name}
                  <span style={{ opacity: .7, fontSize: ".75rem" }}>({brandCounts[b.name] ?? 0})</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product grid ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section header */}
        <div className="d-flex align-items-center justify-content-between mb-7">
          <div>
            <h2 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>
              {activeBrand
                ? `${BRANDS.find((b) => b.name === activeBrand)?.emoji ?? ""} ${activeBrand} Collection`
                : "👕 All Products"
              }
            </h2>
            <p className="mb-0" style={{ color: "#64748b", fontSize: ".82rem" }}>
              {filtered.length} {filtered.length === 1 ? "item" : "items"}{activeBrand ? ` in ${activeBrand}` : " available"}
            </p>
          </div>
          {activeBrand && (
            <Link href={query ? `/?q=${encodeURIComponent(query)}` : "/"}
              className="text-decoration-none d-flex align-items-center gap-1"
              style={{ color: "#94a3b8", fontSize: ".82rem" }}>
              ✕ Clear filter
            </Link>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">
              No products found
              {query ? ` for "${q}"` : ""}
              {activeBrand ? ` in ${activeBrand}` : ""}.
            </p>
            <Link href="/" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
              Clear all filters
            </Link>
          </div>
        )}
      </div>

      <NailSpaBooking />
    </>
  );
}
