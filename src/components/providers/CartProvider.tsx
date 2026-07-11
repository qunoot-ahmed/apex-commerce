"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { calculateCartTotals } from "@/lib/cart/calculations";
import { updateItemQuantity } from "@/lib/cart/cart-service";
import type { CartLineItem, CartState, CartTotals } from "@/types/cart";
import type { Product } from "@/types/catalog";

const STORAGE_KEY = "apex-cart";

interface CartContextValue {
  items: CartLineItem[];
  totals: CartTotals;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadStoredItems(): CartLineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLineItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems(items: CartLineItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

async function syncWithApi(
  action: string,
  items: CartLineItem[],
  extra: Record<string, unknown> = {}
): Promise<CartState> {
  const isCalculate = action === "calculate";
  const res = await fetch("/api/cart", {
    method: isCalculate ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(isCalculate ? { items } : { action, items, ...extra }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Cart API failed.");
  }
  return res.json();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>(() => loadStoredItems());
  const [totals, setTotals] = useState<CartTotals>(() =>
    calculateCartTotals(loadStoredItems())
  );
  const [isLoading] = useState(false);

  const persist = useCallback(async (nextItems: CartLineItem[]) => {
    setItems(nextItems);
    saveItems(nextItems);
    const state = await syncWithApi("calculate", nextItems);
    setItems(state.items);
    setTotals(state.totals);
    saveItems(state.items);
  }, []);

  const addToCart = useCallback(
    async (product: Product, quantity = 1) => {
      const state = await syncWithApi("add", items, {
        productId: product.id,
        quantity,
      });
      setItems(state.items);
      setTotals(state.totals);
      saveItems(state.items);
    },
    [items]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      await persist(updateItemQuantity(items, productId, quantity));
    },
    [items, persist]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      const state = await syncWithApi("remove", items, { productId });
      setItems(state.items);
      setTotals(state.totals);
      saveItems(state.items);
    },
    [items]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setTotals(calculateCartTotals([]));
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      items,
      totals,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      itemCount: totals.itemCount,
    }),
    [items, totals, isLoading, addToCart, updateQuantity, removeFromCart, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
