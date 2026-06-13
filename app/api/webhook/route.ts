import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[Webhook] Signature failed:', err);
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId } = session.metadata || {};
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price.product'] });

        const subtotal = (session.amount_subtotal || 0) / 100;
        const total    = (session.amount_total || 0) / 100;
        const tax      = (session.total_details?.amount_tax || 0) / 100;
        const shipping = (session.total_details?.amount_shipping || 0) / 100;

        const items = lineItems.data.map(item => {
          const product = item.price?.product as Stripe.Product;
          return {
            productId: product?.metadata?.productId || 'unknown',
            quantity: item.quantity || 1,
            price: (item.price?.unit_amount || 0) / 100,
            name: item.description || 'Product',
            image: product?.images?.[0],
          };
        });

        const order = await prisma.order.create({
          data: {
            userId: userId || 'guest', status: 'CONFIRMED',
            subtotal, tax, shipping, total,
            stripeSessionId: session.id,
            stripePaymentId: session.payment_intent as string,
            items: { create: items },
          },
        });

        // Reduce inventory
        for (const item of items) {
          if (item.productId !== 'unknown') {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            }).catch(() => {});
          }
        }
        console.log('[Webhook] Order created:', order.id);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await prisma.order.updateMany({
            where: { stripePaymentId: charge.payment_intent as string },
            data: { status: 'REFUNDED' },
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error(`[Webhook] Error for ${event.type}:`, err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
