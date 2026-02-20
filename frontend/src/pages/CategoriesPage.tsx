import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const { categories, addCategory, renameCategory, deleteCategory } = useCategories();
  const { products } = useProducts();
  const [newName, setNewName] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) { toast.error('Name is required'); return; }
    if (newName.trim().length > 50) { toast.error('Max 50 characters'); return; }
    const ok = addCategory(newName.trim());
    if (!ok) { toast.error('Category already exists'); return; }
    setNewName('');
    toast.success('Category added');
  };

  const handleRename = (oldName: string) => {
    if (!editName.trim()) { toast.error('Name is required'); return; }
    if (editName.trim().length > 50) { toast.error('Max 50 characters'); return; }
    const ok = renameCategory(oldName, editName.trim());
    if (!ok) { toast.error('Category name already taken'); return; }
    setEditingIdx(null);
    toast.success('Category renamed');
  };

  const getProductCount = (category: string) =>
    products.filter(p => p.category === category).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground">{categories.length} categories</p>
      </div>

      {/* Add new */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Add Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Category name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              maxLength={50}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="pt-6">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Tag className="mb-3 h-12 w-12" />
              <p className="text-lg font-medium">No categories yet</p>
              <p className="text-sm">Create categories to organize your products</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <div
                  key={cat}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  {editingIdx === idx ? (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        maxLength={50}
                        className="h-8"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRename(cat);
                          if (e.key === 'Escape') setEditingIdx(null);
                        }}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRename(cat)}>
                        <Check className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingIdx(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{cat}</span>
                        <Badge variant="secondary">{getProductCount(cat)} products</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingIdx(idx); setEditName(cat); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(cat)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && getProductCount(deleteTarget) > 0
                ? `This category has ${getProductCount(deleteTarget)} product(s). Products will keep their current category label but it won't appear in the list.`
                : 'This category will be permanently removed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteTarget) { deleteCategory(deleteTarget); setDeleteTarget(null); toast.success('Category deleted'); } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
