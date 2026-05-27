/**
 * lib/products.ts
 *
 * Fetches the product catalog from Dovara (products.json published by the
 * POS export job) and maps the goldenmart schema to the storefront Product type.
 *
 * Cache strategy: ISR — re-fetches every 5 minutes on the server so the
 * storefront always reflects recent price / stock changes without a redeploy.
 */

import type { Product } from "@/lib/types";

const PRODUCTS_API_URL =
  process.env.PRODUCTS_API_URL ?? "https://dovara.biz/api/v1/products.php";

/** Raw shape returned by the Dovara products endpoint */
interface RawProduct {
  sku: string;
  barcode: string | null;
  name: string;
  price_cents: number | null;
  stock_qty: number;
  image_url: string | null;
  category: string | null;
  unit_of_measure: string | null;
  taxable: number;
  active: number;
}

/** Derive a URL-safe id from the product */
function makeId(raw: RawProduct): string {
  const base = raw.barcode ?? raw.sku;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Best-effort brand extraction from product name/sku */
function deriveBrand(raw: RawProduct): string | undefined {
  const name = raw.name.toLowerCase();
  const sku  = raw.sku.toLowerCase();
  if (name.includes("pro club") || sku.startsWith("itm_pc") || name.startsWith("pc ")) return "Pro Club";
  if (name.includes("shaka"))                                                           return "Shaka";
  if (name.startsWith("aaa") || name.startsWith("3a") || sku.includes("3a"))           return "AAA";
  return undefined;
}

function mapProduct(raw: RawProduct): Product {
  return {
    id:          makeId(raw),
    sku:         raw.sku,
    name:        raw.name,
    description: "",
    price:       raw.price_cents != null ? raw.price_cents / 100 : 0,
    badge:       null,
    sizes:       [],
    colors:      [],
    image:       raw.image_url ?? undefined,
    brand:       deriveBrand(raw),
    category:    raw.category ?? undefined,
    stockQty:    raw.stock_qty,
  };
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(PRODUCTS_API_URL, {
    next: { revalidate: 300 },  // ISR: revalidate every 5 minutes
  });

  if (!res.ok) {
    console.error(`[products] fetch failed: ${res.status} ${res.statusText}`);
    return [];
  }

  const data: { products: RawProduct[] } = await res.json();
  return (data.products ?? []).map(mapProduct);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const all = await getProducts();
  return all.find((p) => p.id === id);
}
