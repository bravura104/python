export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  badge: string | null;
  sizes: string[];
  colors: ProductColor[];
  image?: string;
  brand?: string;
  category?: string;
  /** Original SKU from the POS system (goldenmart item code) */
  sku?: string;
  /** Stock quantity from the POS system */
  stockQty?: number;
  /** Per-variant barcode map keyed by "Size_Color" (e.g. "M_White") — value is the POS barcode */
  variants?: Record<string, string>;
  /** Per-variant price map keyed by "Size_Color" — present only when prices differ across variants */
  prices?: Record<string, number>;
  /** Per-variant stock quantity map keyed by "Size_Color" — baked from POS at export time */
  stocks?: Record<string, number>;
  /** Per-color image URL map keyed by color name — present when variants have distinct images */
  images?: Record<string, string>;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  colorHex: string;
  quantity: number;
  image?: string;
  barcode?: string;
}
