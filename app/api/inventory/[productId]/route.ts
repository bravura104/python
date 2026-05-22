import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  // Validate slug format — same rules as dovara endpoint
  if (!/^[a-z0-9-]{1,100}$/.test(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const inventoryUrl = process.env.DOVARA_INVENTORY_URL;
  if (!inventoryUrl) {
    // Inventory not configured — return empty (all SKUs treated as available)
    return NextResponse.json({ product_id: productId, skus: [] });
  }

  try {
    const res = await fetch(
      `${inventoryUrl}?product_id=${encodeURIComponent(productId)}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return NextResponse.json({ product_id: productId, skus: [] });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Inventory API unavailable — return empty so the UI doesn't block purchases
    return NextResponse.json({ product_id: productId, skus: [] });
  }
}
