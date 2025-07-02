import React, { createContext, useContext, useState, useEffect } from "react";
import { apiConfig } from "@/config/api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [creatorId, setCreatorId] = useState(null);
  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    if (!token) return;
    const res = await fetch(apiConfig.endpoints.cart.get, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCart(Array.isArray(data.cart) ? data.cart : []);
      setCreatorId(data.creatorId || null);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, [token]);

  const addToCart = async (contentId, contentCreatorId) => {
    if (!token) return;
    // Restrict to single creator
    if (creatorId && creatorId !== contentCreatorId) {
      alert("You can only add items from one creator at a time.");
      return;
    }
    await fetch(apiConfig.endpoints.cart.add, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contentId, creatorId: contentCreatorId }),
    });
    setCart((prev) => [...new Set([...prev, contentId])]);
    setCreatorId(contentCreatorId);
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
    // If cart is empty after removal, clear creatorId
    if (cart.length === 1) setCreatorId(null);
  };

  const clearCart = async () => {
    if (!token) return;
    await fetch(apiConfig.endpoints.cart.clear, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCart([]);
    setCreatorId(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        creatorId,
        addToCart,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
