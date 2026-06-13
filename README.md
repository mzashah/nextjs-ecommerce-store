# Next.js E-commerce Store

Full-stack e-commerce store built with Next.js 14, Stripe payments, Prisma ORM, and Tailwind CSS.

## Features

- Product catalog with categories, search, and filters
- Shopping cart with localStorage persistence
- Stripe Checkout integration
- Webhook handler for payment confirmation
- Order tracking and management
- Admin panel for inventory management
- Image upload via Cloudinary
- NextAuth.js authentication
- Reviews and ratings
- Responsive design (mobile-first)

## Architecture

```
  Next.js 14 (App Router)
  ├── app/                     # App Router pages
  │   ├── page.tsx             # Homepage
  │   ├── products/            # Product listing + detail
  │   ├── cart/                # Shopping cart
  │   ├── checkout/            # Stripe checkout
  │   ├── orders/              # Order history
  │   ├── admin/               # Admin dashboard
  │   └── api/                 # API routes
  │       ├── checkout/        # Stripe session
  │       └── webhook/         # Stripe webhook
  ├── components/              # Reusable UI
  ├── lib/                     # Stripe, Prisma, utils
  └── prisma/                  # Schema + migrations
```

## Setup

### Prerequisites
- Node.js 20+
- PostgreSQL (or use the included Docker setup)
- Stripe account

### Installation

```bash
git clone https://github.com/mzashah/nextjs-ecommerce-store
cd nextjs-ecommerce-store
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Database setup
npx prisma generate
npx prisma db push

# Seed sample data (optional)
npx prisma db seed

# Start development server
npm run dev
```

### Docker (PostgreSQL only)
```bash
docker run -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=ecommerce -p 5432:5432 -d postgres:16
```

## Stripe Testing

Use test card: `4242 4242 4242 4242` (any future date, any CVC)

For webhook testing with Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

## Environment Variables

See `.env.example` for all required variables.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v5
- **Payments:** Stripe
- **Styling:** Tailwind CSS
- **Images:** Cloudinary
- **Deployment:** Vercel

## License

MIT
