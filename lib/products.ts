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
import path from "node:path";
import { readFile } from "node:fs/promises";
import staticProducts from "@/data/products.json";

const PRODUCTS_API_URL =
  process.env.PRODUCTS_API_URL ?? "https://dovara.biz/api/v1/products.php";

function mapRawItems(raw: unknown): Product[] {
  const wrapper = raw as { products?: unknown[]; value?: unknown[] };
  const items: unknown[] = Array.isArray(raw)
    ? raw
    : (wrapper.products ?? wrapper.value ?? []);

  return items.map((item) => {
    const r = item as Record<string, unknown>;
    if (Array.isArray(r.sizes)) {
      return mapGrouped(r as unknown as RawProductGrouped);
    }
    return mapLegacy(r as unknown as RawProductLegacy);
  });
}

function getProductsFromStaticImport(): Product[] | null {
  try {
    return mapRawItems(staticProducts);
  } catch {
    return null;
  }
}

async function getProductsFromLocalFile(): Promise<Product[] | null> {
  try {
    const p = path.join(process.cwd(), "data", "products.json");
    const txt = await readFile(p, "utf8");
    return mapRawItems(JSON.parse(txt));
  } catch {
    return null;
  }
}

async function getProductsFromPublicFile(): Promise<Product[] | null> {
  try {
    const p = path.join(process.cwd(), "public", "products.json");
    const txt = await readFile(p, "utf8");
    return mapRawItems(JSON.parse(txt));
  } catch {
    return null;
  }
}

/** Old per-variant shape (from export-products.ps1 era) */
interface RawProductLegacy {
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

/** New grouped shape (from generate-products-json.ps1) — mirrors the Product interface */
interface RawProductGrouped {
  id: string;
  name: string;
  price: number;
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
  variants?: Record<string, string>;
  prices?: Record<string, number>;
  stocks?: Record<string, number>;
  images?: Record<string, string>;
  brand?: string;
  category?: string;
  description?: string;
  badge?: string | null;
  image?: string;
  sku?: string;
  stock_qty?: number;
}

/** Best-effort brand extraction from product name/sku */
function deriveBrand(name: string, sku?: string): string | undefined {
  const n = name.toLowerCase();
  const s = (sku ?? "").toLowerCase();
  if (n.includes("pro club") || n.includes("proclub") || s.startsWith("itm_pc") || n.startsWith("pc ")) return "Pro Club";
  if (n.includes("shaka"))                                                       return "Shaka";
  if (n.startsWith("aaa") || n.startsWith("3a") || s.includes("3a"))            return "AAA";
  return undefined;
}

function mapLegacy(raw: RawProductLegacy): Product {
  const base = raw.barcode ?? raw.sku;
  const id = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return {
    id,
    sku:         raw.sku,
    name:        raw.name,
    description: "",
    price:       raw.price_cents != null ? raw.price_cents / 100 : 0,
    badge:       null,
    sizes:       [],
    colors:      [],
    image:       raw.image_url ?? undefined,
    brand:       deriveBrand(raw.name, raw.sku),
    category:    raw.category ?? undefined,
    stockQty:    raw.stock_qty,
  };
}

function mapGrouped(raw: RawProductGrouped): Product {
  return {
    id:          raw.id,
    sku:         raw.sku,
    name:        raw.name,
    description: raw.description ?? "",
    price:       raw.price,
    badge:       raw.badge ?? null,
    sizes:       raw.sizes,
    colors:      raw.colors,
    variants:    raw.variants,
    prices:      raw.prices,
    stocks:      raw.stocks,
    images:      raw.images,
    image:       raw.image,
    brand:       raw.brand ?? deriveBrand(raw.name, raw.sku),
    category:    raw.category,
    stockQty:    raw.stock_qty,
  };
}

export async function getProducts(): Promise<Product[]> {
  // 1. Static import — always bundled into the Vercel serverless function.
  const bundled = getProductsFromStaticImport();
  if (bundled && bundled.length > 0) return bundled;

  // 2. Prefer repository-local generated data so storefront is deterministic after deploy.
  const local = await getProductsFromLocalFile();
  if (local && local.length > 0) {
    return local;
  }

  // Fallback to the public static asset if present (ensures Vercel deployments
  // that include `public/products.json` will use the baked catalog).
  const pub = await getProductsFromPublicFile();
  if (pub && pub.length > 0) return pub;

  const res = await fetch(PRODUCTS_API_URL, {
    next: { revalidate: 300 },  // ISR: revalidate every 5 minutes
  });

  if (!res.ok) {
    console.error(`[products] fetch failed: ${res.status} ${res.statusText}`);
    return [];
  }

  return mapRawItems(await res.json());
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const all = await getProducts();
  return all.find((p) => p.id === id);
}
