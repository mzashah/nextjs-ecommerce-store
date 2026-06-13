'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem { id: string; name: string; price: number; image?: string; quantity: number; }
type CartAction =
  | { type: 'ADD_ITEM'; item: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] };

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function reducer(state: { items: CartItem[] }, action: CartAction): { items: CartItem[] } {
  switch (action.type) {
    case 'ADD_ITEM': {
      const ex = state.items.find(i => i.id === action.item.id);
      if (ex) return { items: state.items.map(i => i.id === action.item.id ? { ...i, quantity: i.quantity + (action.item.quantity || 1) } : i) };
      return { items: [...state.items, { ...action.item, quantity: action.item.quantity || 1 }] };
    }
    case 'REMOVE_ITEM': return { items: state.items.filter(i => i.id !== action.id) };
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) return { items: state.items.filter(i => i.id !== action.id) };
      return { items: state.items.map(i => i.id === action.id ? { ...i, quantity: action.quantity } : i) };
    case 'CLEAR_CART': return { items: [] };
    case 'LOAD_CART': return { items: action.items };
    default: return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try { const s = localStorage.getItem('cart'); if (s) dispatch({ type: 'LOAD_CART', items: JSON.parse(s) }); } catch { }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('cart', JSON.stringify(state.items)); } catch { }
  }, [state.items]);

  const total     = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      addItem:        (item) => dispatch({ type: 'ADD_ITEM', item }),
      removeItem:     (id)   => dispatch({ type: 'REMOVE_ITEM', id }),
      updateQuantity: (id, q) => dispatch({ type: 'UPDATE_QUANTITY', id, quantity: q }),
      clearCart:      ()     => dispatch({ type: 'CLEAR_CART' }),
      total, itemCount,
      isInCart: (id) => state.items.some(i => i.id === id),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
