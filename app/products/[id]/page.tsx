import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Props { params: { id: string }; }

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { id: params.id, isActive: true },
    include: {
      category: true,
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    take: 4,
  });

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length : 0;

  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <nav className="flex text-sm text-gray-400 mb-8 gap-2">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white">Products</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
            {product.images[0] ? (
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-8xl">📦</div>
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-pink-600 text-white text-sm px-3 py-1 rounded-full font-bold">
                -{discount}% OFF
              </span>
            )}
          </div>
          <div>
            <p className="text-purple-400 uppercase text-sm mb-2">{product.category.name}</p>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={s <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">({product.reviews.length} reviews)</span>
              </div>
            )}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-bold">${Number(product.price).toFixed(2)}</span>
              {product.comparePrice && (
                <span className="text-xl text-gray-500 line-through">${Number(product.comparePrice).toFixed(2)}</span>
              )}
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">{product.description}</p>
            <div className="mb-6">
              {product.stock > 10 ? <span className="text-green-400 font-semibold">In Stock</span>
                : product.stock > 0 ? <span className="text-yellow-400 font-semibold">Only {product.stock} left!</span>
                : <span className="text-red-400 font-semibold">Out of Stock</span>}
            </div>
            <button disabled={product.stock === 0}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-lg disabled:opacity-50 hover:opacity-90 transition">
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            {product.sku && <p className="text-gray-500 text-sm mt-4">SKU: {product.sku}</p>}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-sm">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        {product.reviews.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Reviews ({product.reviews.length})</h2>
            <div className="space-y-4">
              {product.reviews.map(review => (
                <div key={review.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex justify-between mb-3">
                    <span className="font-semibold">{review.user.name || 'Anonymous'}</span>
                    <div className="flex">{[1,2,3,4,5].map(s => <span key={s} className={s <= review.rating ? 'text-yellow-400' : 'text-gray-600'}>★</span>)}</div>
                  </div>
                  {review.title && <h4 className="font-semibold mb-2">{review.title}</h4>}
                  {review.body && <p className="text-gray-400">{review.body}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(r => (
                <Link key={r.id} href={`/products/${r.id}`} className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition">
                  <div className="aspect-square relative bg-gray-800">
                    {r.images[0] ? <Image src={r.images[0]} alt={r.name} fill className="object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-3xl">📦</div>}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium line-clamp-2 mb-1">{r.name}</h3>
                    <span className="text-purple-400 font-bold">${Number(r.price).toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
