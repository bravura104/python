"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import type { CartItem } from "./types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    qty: number
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: "SET"; payload: CartItem[] }
  | { type: "ADD"; payload: CartItem }
  | {
      type: "REMOVE";
      payload: { productId: string; size: string; color: string };
    }
  | {
      type: "UPDATE_QTY";
      payload: { productId: string; size: string; color: string; qty: number };
    }
  | { type: "CLEAR" };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "ADD": {
      const idx = state.findIndex(
        (i) =>
          i.productId === action.payload.productId &&
          i.size === action.payload.size &&
          i.color === action.payload.color
      );
      if (idx >= 0) {
        return state.map((item, i) =>
          i === idx
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      }
      return [...state, action.payload];
    }
    case "REMOVE":
      return state.filter(
        (i) =>
          !(
            i.productId === action.payload.productId &&
            i.size === action.payload.size &&
            i.color === action.payload.color
          )
      );
    case "UPDATE_QTY":
      if (action.payload.qty <= 0) {
        return state.filter(
          (i) =>
            !(
              i.productId === action.payload.productId &&
              i.size === action.payload.size &&
              i.color === action.payload.color
            )
        );
      }
      return state.map((i) =>
        i.productId === action.payload.productId &&
        i.size === action.payload.size &&
        i.color === action.payload.color
          ? { ...i, quantity: action.payload.qty }
          : i
      );
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tshirt-cart");
      if (saved) {
        dispatch({ type: "SET", payload: JSON.parse(saved) as CartItem[] });
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("tshirt-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => dispatch({ type: "ADD", payload: item });
  const removeItem = (productId: string, size: string, color: string) =>
    dispatch({ type: "REMOVE", payload: { productId, size, color } });
  const updateQuantity = (
    productId: string,
    size: string,
    color: string,
    qty: number
  ) => dispatch({ type: "UPDATE_QTY", payload: { productId, size, color, qty } });
  const clearCart = () => dispatch({ type: "CLEAR" });

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
