export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  paymentMethod: 'cash' | 'card';
  amountTendered?: number;
  change?: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

declare global {
  interface Window {
    go: {
      main: {
        App: {
          GetProducts(): Promise<Product[]>;
          AddProduct(p: Product): Promise<void>;
          UpdateProduct(p: Product): Promise<void>;
          DeleteProduct(id: string): Promise<void>;
          GetSales(): Promise<Sale[]>;
          CompleteSale(s: Sale): Promise<void>;
          GetCategories(): Promise<Category[]>;
          SaveCategory(c: Category): Promise<void>;
          RenameCategory(oldName: string, newName: string): Promise<void>;
          DeleteCategory(id: string): Promise<void>;
        }
      }
    };
  }
}
