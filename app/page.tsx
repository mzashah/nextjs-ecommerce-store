import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    include: { category: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    take: 6,
  });
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 py-24 px-6">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Shop the Future
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Discover premium products with seamless checkout and fast delivery.
            Your next favorite thing is just a click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-semibold hover:opacity-90 transition"
            >
              Shop Now
            </Link>
            <Link
              href="/products?featured=true"
              className="px-8 py-4 border border-gray-600 rounded-full text-lg font-semibold hover:border-purple-500 transition"
            >
              View Featured
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-800 hover:scale-105 transition-transform"
              >
                {cat.image && (
                  <Image src={cat.image} alt={cat.name} fill className="object-cover opacity-70 group-hover:opacity-90 transition" />
                )}
                <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/70">
                  <span className="font-semibold text-white">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link href="/products" className="text-purple-400 hover:text-pink-400 transition">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(product => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500 transition"
              >
                <div className="aspect-square relative bg-gray-800">
                  {product.images[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">📦</div>
                  )}
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="absolute top-3 left-3 bg-pink-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      SALE
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-gray-400 text-sm mb-1">{product.category.name}</p>
                  <h3 className="font-semibold text-white line-clamp-2 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold text-lg">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-gray-500 line-through text-sm">
                        ${Number(product.comparePrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-sm text-gray-400">
                    {product.stock > 0 ? (
                      <span className="text-green-400">In Stock</span>
                    ) : (
                      <span className="text-red-400">Out of Stock</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-purple-900 to-pink-900 py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-gray-300 mb-8">Get notified about new products, sales, and exclusive offers.</p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-purple-900 rounded-full font-semibold hover:bg-gray-100 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-white mb-4">Shop</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/products" className="hover:text-white transition">All Products</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-white transition">Featured</Link></li>
              <li><Link href="/products?sort=newest" className="hover:text-white transition">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Account</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/orders" className="hover:text-white transition">Orders</Link></li>
              <li><Link href="/cart" className="hover:text-white transition">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition">Returns</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
          © {new Date().getFullYear()} ShopNext. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
