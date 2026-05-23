export const SHIPPING_RATES = {
  standard: {
    label: "Standard — Ships in 3–5 business days",
    price: 4.99,
  },
  sameday_ontario: {
    label: "Same-day delivery (Ontario only)",
    price: 9.99,
  },
} as const;

export type ShippingOptionKey = keyof typeof SHIPPING_RATES;

export const FREE_SHIPPING_THRESHOLD = 60;

// California state sales tax rate (7.75% — statewide base 7.25% + average district)
// Applied to product subtotal only; shipping charges are non-taxable in CA.
export const CA_TAX_RATE = 0.0775;

export function calcShipping(
  subtotal: number,
  option: ShippingOptionKey
): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_RATES[option].price;
}
