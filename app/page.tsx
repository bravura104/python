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
        className="py-16 px-4 text-white text-center position-relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)" }}
      >
        {/* subtle grid pattern overlay */}
        <div
          aria-hidden
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.03) 40px,rgba(255,255,255,.03) 41px)," +
              "repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,.03) 40px,rgba(255,255,255,.03) 41px)",
            pointerEvents: "none",
          }}
        />

        <div className="position-relative" style={{ zIndex: 1 }}>
          <p className="text-uppercase tracking-widest mb-2" style={{ color: "#a78bfa", letterSpacing: "0.2em", fontSize: ".8rem", fontWeight: 600 }}>
            Premium Blank Tees &amp; Custom Prints
          </p>
          <h1 className="display-4 fw-black mb-3" style={{ letterSpacing: "-1px" }}>
            DingTee <span style={{ color: "#a78bfa" }}>909</span>
          </h1>
          <p className="lead mb-6 mx-auto" style={{ maxWidth: 520, color: "#cbd5e1" }}>
            Quality blanks from top brands. Perfect for custom printing, retail, or just a great everyday tee.
          </p>

          {/* Brand pills */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-8">
            {BRANDS.map((b) => (
              <Link
                key={b.name}
                href={brandLink(b.name)}
                className="text-decoration-none"
              >
                <span
                  className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-semibold"
                  style={{
                    background: activeBrand === b.name ? b.color : "rgba(255,255,255,0.1)",
                    color: "#fff",
                    border: `1.5px solid ${activeBrand === b.name ? b.color : "rgba(255,255,255,0.2)"}`,
                    fontSize: ".9rem",
                    transition: "all .15s",
                  }}
                >
                  <span>{b.emoji}</span>
                  {b.name}
                  <span
                    className="rounded-pill ms-1 px-2"
                    style={{ background: "rgba(255,255,255,.15)", fontSize: ".75rem" }}
                  >
                    {brandCounts[b.name] ?? 0}
                  </span>
                </span>
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="d-flex flex-wrap justify-content-center gap-4" style={{ color: "#94a3b8", fontSize: ".85rem" }}>
            {[
              { label: "Brands", value: BRANDS.length.toString() },
              { label: "Products",  value: `${allProducts.length}+` },
              { label: "Colors available", value: "30+" },
              { label: "Sizes up to", value: "5XL" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="fw-bold" style={{ color: "#e2e8f0", fontSize: "1.3rem" }}>{value}</div>
                <div>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
        {/* Active filter label */}
        {activeBrand && (
          <div className="d-flex align-items-center gap-2 mb-6">
            <span
              className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill text-white fw-semibold"
              style={{ background: BRANDS.find((b) => b.name === activeBrand)?.color ?? "#111", fontSize: ".85rem" }}
            >
              {BRANDS.find((b) => b.name === activeBrand)?.emoji} {activeBrand}
            </span>
            <Link href={query ? `/?q=${encodeURIComponent(query)}` : "/"} className="text-sm text-gray-400 hover:text-gray-600 text-decoration-none">
              ✕ Clear filter
            </Link>
          </div>
        )}

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
