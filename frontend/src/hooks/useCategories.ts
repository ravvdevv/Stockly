import { useState, useCallback, useEffect } from 'react';
import { Category } from '@/lib/types';

export function useCategories() {
  const [categories, setCategoriesState] = useState<string[]>([]);
  const [detailedCategories, setDetailedCategories] = useState<Category[]>([]);

  const refresh = useCallback(async () => {
    const data = await window.go.main.App.GetCategories();
    setDetailedCategories(data || []);
    setCategoriesState((data || []).map(c => c.name));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCategory = useCallback(async (name: string) => {
    if (categories.some(c => c.toLowerCase() === name.toLowerCase())) return false;

    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    await window.go.main.App.SaveCategory(newCategory);
    await refresh();
    return true;
  }, [categories, refresh]);

  const renameCategory = useCallback(async (oldName: string, newName: string) => {
    const category = detailedCategories.find(c => c.name === oldName);
    if (!category) return false;

    if (categories.some(c => c.toLowerCase() === newName.toLowerCase() && c !== oldName)) return false;

    await window.go.main.App.RenameCategory(oldName, newName.trim());
    await refresh();
    return true;
  }, [categories, detailedCategories, refresh]);

  const deleteCategory = useCallback(async (name: string) => {
    const category = detailedCategories.find(c => c.name === name);
    if (category) {
      await window.go.main.App.DeleteCategory(category.id);
      await refresh();
    }
  }, [detailedCategories, refresh]);

  return { categories, refresh, addCategory, renameCategory, deleteCategory };
}
