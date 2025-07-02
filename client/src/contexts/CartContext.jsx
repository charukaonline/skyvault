import React, { createContext, useContext, useState, useEffect } from "react";
import { apiConfig } from "@/config/api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    if (!token) return;
    const res = await fetch(apiConfig.endpoints.cart.get, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCart(Array.isArray(data) ? data : []);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, [token]);

  const addToCart = async (contentId) => {
    if (!token) return;
    await fetch(apiConfig.endpoints.cart.add, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contentId }),
    });
    setCart((prev) => [...new Set([...prev, contentId])]);
  };

  const removeFromCart = async (contentId) => {
    if (!token) return;
    await fetch(apiConfig.endpoints.cart.remove, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contentId }),
    });
    setCart((prev) => prev.filter((id) => id !== contentId));
  };

  const clearCart = async () => {
    if (!token) return;
    await fetch(apiConfig.endpoints.cart.clear, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
