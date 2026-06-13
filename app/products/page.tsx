import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

interface Props {
  searchParams: { category?: string; search?: string; sort?: string; minPrice?: string; maxPrice?: string; page?: string; };
}

const PAGE_SIZE = 12;

export default async function ProductsPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = { isActive: true };
  if (searchParams.category) where.category = { slug: searchParams.category };
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { description: { contains: searchParams.search, mode: 'insensitive' } },
    ];
  }
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {
      ...(searchParams.minPrice ? { gte: parseFloat(searchParams.minPrice) } : {}),
      ...(searchParams.maxPrice ? { lte: parseFloat(searchParams.maxPrice) } : {}),
    };
  }

  const sortMap: Record<string, Record<string, string>> = {
    newest: { createdAt: 'desc' }, oldest: { createdAt: 'asc' },
    'price-asc': { price: 'asc' }, 'price-desc': { price: 'desc' }, 'name-asc': { name: 'asc' },
  };
  const orderBy = sortMap[searchParams.sort || 'newest'] || { createdAt: 'desc' };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: PAGE_SIZE, include: { category: true } }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-2">All Products</h1>
        <p className="text-gray-400 mb-8">{total} product{total !== 1 ? 's' : ''} found</p>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="font-bold text-lg mb-4">Categories</h2>
              <div className="space-y-1">
                <Link href="/products" className={`block px-3 py-2 rounded-lg text-sm transition ${!searchParams.category ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>All</Link>
                {categories.map(cat => (
                  <Link key={cat.id} href={`/products?category=${cat.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition ${searchParams.category === cat.slug ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-24 text-gray-500">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-xl">No products found</p>
                <Link href="/products" className="mt-4 inline-block text-purple-400">Clear filters</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map(product => (
                  <Link key={product.id} href={`/products/${product.id}`}
                    className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500 transition-all hover:-translate-y-1">
                    <div className="aspect-square relative bg-gray-800">
                      {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-5xl">📦</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-purple-400 mb-1">{product.category.name}</p>
                      <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">${Number(product.price).toFixed(2)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                          {product.stock > 0 ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Link key={p} href={`/products?page=${p}`}
                    className={`px-4 py-2 rounded-lg transition ${p === page ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
