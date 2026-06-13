'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './CartProvider';

interface Product {
  id: string; name: string; price: number; comparePrice?: number | null;
  images: string[]; stock: number; category?: { name: string };
}

interface Props { product: Product; showCategory?: boolean; }

export default function ProductCard({ product, showCategory = true }: Props) {
  const { addItem, isInCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!product.stock) return;
    addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0], quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500 transition-all duration-300 hover:-translate-y-1">
        <div className="aspect-square relative bg-gray-800 overflow-hidden">
          {product.images[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-5xl">📦</div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discount > 0 && <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full font-semibold">-{discount}%</span>}
            {!product.stock && <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">Sold Out</span>}
          </div>
          <button onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className={wishlisted ? 'text-red-400' : 'text-white'}>{wishlisted ? '♥' : '♡'}</span>
          </button>
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button onClick={handleAdd} disabled={!product.stock}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${added ? 'bg-green-600 text-white' : product.stock ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
              {added ? 'Added!' : product.stock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
        <div className="p-4">
          {showCategory && product.category && <p className="text-xs text-purple-400 uppercase mb-1">{product.category.name}</p>}
          <h3 className="font-semibold text-white line-clamp-2 mb-2 text-sm">{product.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">${product.price.toFixed(2)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-gray-500 line-through text-sm">${product.comparePrice.toFixed(2)}</span>
              )}
            </div>
            {isInCart(product.id) && <span className="text-xs text-purple-400">In cart</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
