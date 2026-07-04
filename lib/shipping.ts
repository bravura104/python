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

export type FeeConfig = {
  fixedFeeRate: number;
  paymentFeeRate: number;
  serviceFeeRate: number;
  marketingFeeRate: number;
  taxRate: number;
};

export type DisbursementBreakdown = {
  subtotal: number;
  fixedFee: number;
  paymentFee: number;
  serviceFee: number;
  marketingFee: number;
  tax: number;
  discount: number;
  disbursementAmount: number;
};

export const DEFAULT_FEE_CONFIG: FeeConfig = {
  fixedFeeRate: 0,
  paymentFeeRate: 0,
  serviceFeeRate: 0,
  marketingFeeRate: 0,
  taxRate: CA_TAX_RATE,
};

export function getFeeConfig(): FeeConfig {
  return {
    fixedFeeRate: Number(process.env.DISBURSEMENT_FIXED_FEE_RATE ?? DEFAULT_FEE_CONFIG.fixedFeeRate),
    paymentFeeRate: Number(process.env.DISBURSEMENT_PAYMENT_FEE_RATE ?? DEFAULT_FEE_CONFIG.paymentFeeRate),
    serviceFeeRate: Number(process.env.DISBURSEMENT_SERVICE_FEE_RATE ?? DEFAULT_FEE_CONFIG.serviceFeeRate),
    marketingFeeRate: Number(process.env.DISBURSEMENT_MARKETING_FEE_RATE ?? DEFAULT_FEE_CONFIG.marketingFeeRate),
    taxRate: Number(process.env.DISBURSEMENT_TAX_RATE ?? DEFAULT_FEE_CONFIG.taxRate),
  };
}

export function calcDisbursementAmount(
  subtotal: number,
  feeConfig: FeeConfig = getFeeConfig()
): DisbursementBreakdown {
  const fixedFee = subtotal * feeConfig.fixedFeeRate;
  const paymentFee = subtotal * feeConfig.paymentFeeRate;
  const serviceFee = subtotal * feeConfig.serviceFeeRate;
  const marketingFee = subtotal * feeConfig.marketingFeeRate;
  const tax = subtotal * feeConfig.taxRate;
  const discount = fixedFee + paymentFee + serviceFee + marketingFee + tax;
  const disbursementAmount = Math.max(0, subtotal - discount);

  return {
    subtotal,
    fixedFee,
    paymentFee,
    serviceFee,
    marketingFee,
    tax,
    discount,
    disbursementAmount,
  };
}

export function calcShipping(
  subtotal: number,
  option: ShippingOptionKey
): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_RATES[option].price;
}
