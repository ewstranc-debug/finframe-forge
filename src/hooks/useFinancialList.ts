import { useCallback } from 'react';

interface UseFinancialListOptions<T extends { id: string }> {
  items: T[];
  setItems: (items: T[]) => void;
  generateId?: () => string;
  defaultItem: Omit<T, 'id'>;
}

/**
 * Custom hook for managing CRUD operations on financial lists
 * (debts, affiliates, uses of funds, etc.)
 */
export function useFinancialList<T extends { id: string }>({
  items,
  setItems,
  generateId = () => Date.now().toString(),
  defaultItem,
}: UseFinancialListOptions<T>) {
  
  const addItem = useCallback(() => {
    const newItem = { ...defaultItem, id: generateId() } as T;
    setItems([...items, newItem]);
    return newItem;
  }, [items, setItems, generateId, defaultItem]);

  const updateItem = useCallback((id: string, updates: Partial<Omit<T, 'id'>>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, [items, setItems]);

  const updateItemField = useCallback(<K extends keyof Omit<T, 'id'>>(
    id: string,
    field: K,
    value: T[K]
  ) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, [items, setItems]);

  const removeItem = useCallback((id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
      return true;
    }
    return false;
  }, [items, setItems]);

  const clearItem = useCallback((id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...defaultItem, id } as T : item
    ));
  }, [items, setItems, defaultItem]);

  const reorderItems = useCallback((fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    setItems(newItems);
  }, [items, setItems]);

  const getItem = useCallback((id: string): T | undefined => {
    return items.find(item => item.id === id);
  }, [items]);

  const getItemIndex = useCallback((id: string): number => {
    return items.findIndex(item => item.id === id);
  }, [items]);

  return {
    items,
    addItem,
    updateItem,
    updateItemField,
    removeItem,
    clearItem,
    reorderItems,
    getItem,
    getItemIndex,
    count: items.length,
    isEmpty: items.length === 0,
    canRemove: items.length > 1,
  };
}

export default useFinancialList;
