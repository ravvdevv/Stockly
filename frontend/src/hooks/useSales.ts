import { useState, useCallback, useEffect } from 'react';
import { Sale, CartItem } from '@/lib/types';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);

  const refresh = useCallback(async () => {
    const data = await window.go.main.App.GetSales();
    setSales(data || []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const completeSale = useCallback(async (
    cart: CartItem[],
    taxRate: number,
    paymentMethod: 'cash' | 'card',
    amountTendered?: number
  ) => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    const change = amountTendered ? amountTendered - total : 0;

    const sale: Sale = {
      id: crypto.randomUUID(),
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal,
      tax,
      taxRate,
      total,
      paymentMethod,
      amountTendered,
      change: Math.max(0, change),
      createdAt: new Date().toISOString(),
    };

    await window.go.main.App.CompleteSale(sale);
    await refresh();
    return sale;
  }, [refresh]);

  return { sales, refresh, completeSale };
}
