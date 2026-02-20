import { useState } from 'react';
import { Product } from '@/lib/types';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt'>) => void;
}

export default function ProductFormDialog({ open, onOpenChange, product, onSubmit }: ProductFormDialogProps) {
  const { categories } = useCategories();
  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [stock, setStock] = useState(product?.stock?.toString() ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Required';
    if (!sku.trim()) e.sku = 'Required';
    if (!category.trim()) e.category = 'Required';
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) e.price = 'Must be > 0';
    const s = parseInt(stock);
    if (isNaN(s) || s < 0) e.stock = 'Must be ≥ 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} maxLength={100} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={sku} onChange={e => setSku(e.target.value)} maxLength={50} />
            {errors.sku && <p className="text-sm text-destructive mt-1">{errors.sku}</p>}
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            {categories.length > 0 ? (
              <select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground"
              >
                <option value="">Select category...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <Input id="category" value={category} onChange={e => setCategory(e.target.value)} maxLength={50} placeholder="Type a category or create one in Categories page" />
            )}
            {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" step="0.01" min="0.01" value={price} onChange={e => setPrice(e.target.value)} />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} />
              {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{product ? 'Save' : 'Add Product'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
