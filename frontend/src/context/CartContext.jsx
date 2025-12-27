import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  // Load cart count on mount
  useEffect(() => {
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  const addToCart = (product, quantity = 1) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({ ...product, quantity });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      return true;
    } catch {
      return false;
    }
  };

  const removeFromCart = (productId) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const newCart = cart.filter(item => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(newCart));
      updateCartCount();
    } catch {
      // ignore
    }
  };

  const updateQuantity = (productId, quantity) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const index = cart.findIndex(item => item.id === productId);
      
      if (index >= 0) {
        if (quantity <= 0) {
          cart.splice(index, 1);
        } else {
          cart[index].quantity = quantity;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
      }
    } catch {
      // ignore
    }
  };

  const clearCart = () => {
    localStorage.setItem('cart', '[]');
    setCartCount(0);
  };

  const getCart = () => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartCount, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getCart,
      updateCartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
