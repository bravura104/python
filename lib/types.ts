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
