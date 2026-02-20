import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PhilippinePeso, Banknote, ShoppingBag, TrendingUp, Package } from 'lucide-react';

export default function DashboardPage() {
  const { sales } = useSales();
  const { products } = useProducts();

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalSales = sales.length;
  const totalItems = sales.reduce((sum, s) => sum + s.items.reduce((a, i) => a + i.quantity, 0), 0);

  // Best sellers
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSales.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.price * item.quantity;
      productSales.set(item.productId, existing);
    });
  });
  const bestSellers = [...productSales.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  const statCards = [
    { title: 'Total Sales', value: totalSales, icon: ShoppingBag, format: (v: number) => v.toString() },
    { title: 'Revenue', value: totalRevenue, icon: Banknote, format: (v: number) => `₱${v.toFixed(2)}` },
    { title: 'Items Sold', value: totalItems, icon: TrendingUp, format: (v: number) => v.toString() },
    { title: 'Products', value: products.length, icon: Package, format: (v: number) => v.toString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.format(stat.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Best Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {bestSellers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No sales yet. Complete a checkout to see data here.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bestSellers.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">₱{item.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No sales yet.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {[...sales].reverse().slice(0, 10).map(sale => (
                  <div key={sale.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">{sale.items.length} item(s)</p>
                      <p className="text-xs text-muted-foreground">{new Date(sale.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">₱{sale.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground uppercase">{sale.paymentMethod}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
