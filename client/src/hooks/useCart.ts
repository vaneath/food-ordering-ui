import { useState } from 'react';
import { cartService } from '../services/cartService';
import { Cart, MenuItem } from '../types';

export const useCart = () => {
  const [cart, setCart] = useState<Cart>(cartService.getCart());
  const [loading, setLoading] = useState(false);

  const refreshCart = () => {
    setCart(cartService.getCart());
  };

  const addToCart = async (
    menuItem: MenuItem,
    quantity: number,
    selectedCustomizations: { [customizationId: string]: string[] },
    specialInstructions?: string
  ) => {
    setLoading(true);
    try {
      cartService.addOrMergeItem(menuItem, quantity, selectedCustomizations, specialInstructions);
      refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setLoading(true);
    try {
      cartService.updateItemQuantity(itemId, quantity);
      refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setLoading(true);
    try {
      cartService.removeItem(itemId);
      refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const updateCustomizations = async (
    itemId: string,
    selectedCustomizations: { [customizationId: string]: string[] }
  ) => {
    setLoading(true);
    try {
      cartService.updateItemCustomizations(itemId, selectedCustomizations);
      refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const updateInstructions = async (itemId: string, specialInstructions: string) => {
    setLoading(true);
    try {
      cartService.updateItemInstructions(itemId, specialInstructions);
      refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      cartService.clearCart();
      refreshCart();
    } finally {
      setLoading(false);
    }
  };

  // Calculate itemCount from cart state to make it reactive
  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  return {
    cart,
    loading,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    updateCustomizations,
    updateInstructions,
    clearCart,
    refreshCart
  };
};
