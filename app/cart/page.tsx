'use client';

import { useCart } from '@/components/CartProvider';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <p className="text-7xl mb-6">🛒</p>
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/products" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-semibold hover:opacity-90 transition">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Shopping Cart</h1>
          <button onClick={clearCart} className="text-gray-400 hover:text-red-400 text-sm transition">Clear cart</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 flex gap-4">
                <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                  {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-2xl">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                  <p className="text-purple-400 font-bold">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-400 transition text-xl">×</button>
                  <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">-</button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">+</button>
                  </div>
                  <span className="text-gray-300 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 h-fit">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({itemCount} items)</span><span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-400">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between text-white font-bold text-lg">
                <span>Total</span><span>${orderTotal.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-center font-bold text-lg hover:opacity-90 transition">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
