import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

interface CartItem {
  id: string; name: string; price: number; quantity: number; image?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { items, userId, successUrl, cancelUrl } = await req.json() as {
      items: CartItem[]; userId?: string; successUrl: string; cancelUrl: string;
    };

    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) return NextResponse.json({ error: `Product ${item.name} not found` }, { status: 400 });
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }
    }

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name, images: item.image ? [item.image] : [], metadata: { productId: item.id } },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXTAUTH_URL}/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/cart?cancelled=true`,
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU'] },
      metadata: { userId: userId || 'guest', itemCount: items.length.toString() },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('[Checkout]', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
