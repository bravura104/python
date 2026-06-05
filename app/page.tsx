import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
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

  const allProducts = await getProducts();

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
      {/* ── Sub-header: slogan + brand filters ───────────────────────────── */}
      <div
        className="sticky-top border-bottom"
        style={{
          top: 56,
          zIndex: 9,
          background: "transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="d-flex align-items-center justify-content-between gap-3 py-2" style={{ flexWrap: "wrap" }}>

            {/* Slogan */}
            <div className="d-flex align-items-center gap-2">
              <span className="d-none d-sm-inline" style={{ color: "#c4b5fd" }}>·</span>
              <span className="d-none d-sm-inline" style={{ color: "#6b7280", fontSize: ".8rem" }}>Premium blank tees, print ready</span>
            </div>

            {/* Brand filter pills */}
            <div className="d-flex align-items-center gap-1 overflow-auto" style={{ scrollbarWidth: "none" }}>
              <Link href={brandLink("")} className="text-decoration-none flex-shrink-0">
                <span
                  className="d-inline-block px-3 py-1 rounded-pill fw-medium"
                  style={{
                    background: !activeBrand ? "#312e81" : "rgba(49,46,129,0.08)",
                    color:      !activeBrand ? "#fff"    : "#4b5563",
                    fontSize: ".82rem",
                    whiteSpace: "nowrap",
                    transition: "all .15s",
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
                      background: activeBrand === b.name ? b.color : "rgba(49,46,129,0.08)",
                      color:      activeBrand === b.name ? "#fff"  : "#4b5563",
                      fontSize: ".82rem",
                      whiteSpace: "nowrap",
                      transition: "all .15s",
                    }}
                  >
                    {b.emoji} {b.name}
                    <span style={{ opacity: .65, fontSize: ".72rem" }}>({brandCounts[b.name] ?? 0})</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Product grid ─────────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(175deg, #f7f3ff 0%, #eef2ff 22%, #f5f8ff 60%, #ffffff 100%)" }}>
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
      </div>

    </>
  );
}
