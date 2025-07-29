import { useState, useEffect } from 'react';
import { MenuItem, MenuCategory, FilterOptions } from '../types';
import { menuService } from '../services/menuService';

export const useMenu = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const menuItems = await menuService.getAllItems();
      setItems(menuItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const menuCategories = await menuService.getCategories();
      setCategories(menuCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const searchItems = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await menuService.searchItems(query);
      setItems(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = async (filters: FilterOptions) => {
    setLoading(true);
    setError(null);
    try {
      const results = await menuService.filterItems(filters);
      setItems(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Filter failed');
    } finally {
      setLoading(false);
    }
  };

  const getItemsByCategory = async (category: MenuCategory) => {
    setLoading(true);
    setError(null);
    try {
      const results = await menuService.getItemsByCategory(category);
      setItems(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category items');
    } finally {
      setLoading(false);
    }
  };

  const getItemById = async (id: string): Promise<MenuItem | null> => {
    try {
      return await menuService.getItemById(id);
    } catch (err) {
      console.error('Failed to get item:', err);
      return null;
    }
  };

  useEffect(() => {
    loadAllItems();
    loadCategories();
  }, []);

  return {
    items,
    categories,
    loading,
    error,
    loadAllItems,
    searchItems,
    filterItems,
    getItemsByCategory,
    getItemById
  };
};