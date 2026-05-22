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
}
