import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/lib/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  const refresh = useCallback(async () => {
    const data = await window.go.main.App.GetProducts();
    setProducts(data || []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await window.go.main.App.AddProduct(newProduct);
    await refresh();
    return newProduct;
  }, [refresh]);

  const updateProduct = useCallback(async (product: Product) => {
    await window.go.main.App.UpdateProduct(product);
    await refresh();
  }, [refresh]);

  const deleteProduct = useCallback(async (id: string) => {
    await window.go.main.App.DeleteProduct(id);
    await refresh();
  }, [refresh]);

  return { products, refresh, addProduct, updateProduct, deleteProduct };
}
