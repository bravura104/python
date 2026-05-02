import type Stripe from "stripe";

let _stripe: Stripe | null = null;

async function getStripe(): Promise<Stripe> {
  if (!_stripe) {
    const { default: StripeClass } = await import("stripe");
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new StripeClass(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export default getStripe;
