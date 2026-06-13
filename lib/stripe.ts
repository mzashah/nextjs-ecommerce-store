import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is required');

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
  maxNetworkRetries: 3,
});

export function formatAmount(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export async function getCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer', 'payment_intent'],
  });
}

export async function createPaymentIntent(amountCents: number, currency = 'usd', metadata?: Record<string, string>) {
  return stripe.paymentIntents.create({
    amount: amountCents, currency,
    metadata: metadata || {},
    automatic_payment_methods: { enabled: true },
  });
}
