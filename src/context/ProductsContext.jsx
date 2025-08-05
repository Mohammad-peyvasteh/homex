"use client";



import { createContext, useState, useEffect, useContext } from "react";

const ProductContext = createContext([]);

export const ProductProvider = ({ children }) => {
  const API_ITEMS = "http://localhost:3000/api/products";
  const API_CART = "http://localhost:3000/api/cart";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(API_ITEMS);
        if (!response.ok) throw new Error("Failed to fetch items");
        const listItems = await response.json();
        setItems(listItems);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCart = async () => {
      try {
        const response = await fetch(API_CART);
        if (!response.ok) throw new Error("Failed to fetch cart items");
        const cartData = await response.json();
        setCartItems(cartData);
      } catch (err) {
        console.error(err.message);
      }
    };

    setTimeout(() => {
      fetchItems();
      fetchCart();
    }, 1000);
  }, []);

  const addToCart = async (item) => {
    const existing = cartItems.find((cartItem) => cartItem.id === item.id);
    if (existing) {
      await incrementQty(item.id);
    } else {
      const newCartItem = { ...item, quantity: 1 };
      try {
        const response = await fetch(API_CART, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCartItem),
        });
        if (!response.ok) throw new Error("Failed to add item to cart");
        const updatedCart = await response.json(); // کل کارت برمی‌گردد
        setCartItems(updatedCart);
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  const incrementQty = async (id) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    const updatedQuantity = item.quantity + 1;

    try {
      const response = await fetch(API_CART, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity: updatedQuantity }),
      });
      if (!response.ok) throw new Error("Failed to increase quantity");
      const data = await response.json();
      setCartItems((prev) => prev.map((i) => (i.id === id ? data : i)));
    } catch (err) {
      console.error(err.message);
    }
  };

  const decrementQty = async (id) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    if (item.quantity <= 1) {
      try {
        const response = await fetch(`${API_CART}?id=${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to remove item from cart");
        setCartItems((prev) => prev.filter((i) => i.id !== id));
      } catch (err) {
        console.error(err.message);
      }
    } else {
      const updatedQuantity = item.quantity - 1;
      try {
        const response = await fetch(API_CART, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, quantity: updatedQuantity }),
        });
        if (!response.ok) throw new Error("Failed to decrease quantity");
        const data = await response.json();
        setCartItems((prev) => prev.map((i) => (i.id === id ? data : i)));
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseInt(item.price, 10);
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <ProductContext.Provider
      value={{
        showMenu,
        setShowMenu,
        getTotalPrice,
        items,
        loading,
        cartItems,
        addToCart,
        decrementQty,
        incrementQty,
        showSidebar,
        setShowSidebar,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => useContext(ProductContext);
