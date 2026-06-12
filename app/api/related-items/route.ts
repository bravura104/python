import { NextResponse } from "next/server";
import { getRelationshipItemsBySlug } from "@/lib/db";
import type { Product } from "@/lib/types";

function toStorefrontProduct(item: {
  item_slug: string;
  item_code: string;
  item_name: string;
  item_image?: string | null;
  item_price?: number | null;
}): Product {
  return {
    id: item.item_slug || item.item_code,
    sku: item.item_code,
    name: item.item_name,
    description: "",
    price: Number(item.item_price ?? 0),
    badge: null,
    sizes: [],
    colors: [],
    image: item.item_image ?? undefined,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const productIds = Array.isArray(body?.productIds) ? body.productIds : [];
    const normalizedIds = productIds
      .map((value: unknown) => String(value).trim())
      .filter(Boolean)
      .slice(0, 10);

    if (normalizedIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const related = await Promise.all(
      normalizedIds.map((productId) => getRelationshipItemsBySlug(productId))
    );
    const currentProductIds = new Set(normalizedIds.map((value) => value.toLowerCase()));

    const seen = new Set<string>();
    const items = related.flat().map(toStorefrontProduct).filter((item) => {
      const key = item.id.toLowerCase();
      if (currentProductIds.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ items: items.slice(0, 8) });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}