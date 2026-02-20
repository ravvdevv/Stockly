import { useState } from 'react';
import { useSales } from '@/hooks/useSales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Download, Receipt, Eye, CalendarDays } from 'lucide-react';
import { Sale } from '@/lib/types';

export default function SalesHistoryPage() {
  const { sales } = useSales();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const filtered = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    if (dateFrom && saleDate < new Date(dateFrom)) return false;
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (saleDate > to) return false;
    }
    if (methodFilter && sale.paymentMethod !== methodFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);
  const totalTax = filtered.reduce((sum, s) => sum + s.tax, 0);

  const exportCSV = () => {
    const headers = ['Date', 'Sale ID', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment Method'];
    const rows = filtered.map(sale => [
      new Date(sale.createdAt).toLocaleString(),
      sale.id.slice(0, 8),
      sale.items.map(i => `${i.productName} x${i.quantity}`).join('; '),
      sale.subtotal.toFixed(2),
      sale.tax.toFixed(2),
      sale.total.toFixed(2),
      sale.paymentMethod,
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockly-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales History</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} transactions</p>
        </div>
        <Button onClick={exportCSV} disabled={filtered.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="dateFrom">From</Label>
              <Input id="dateFrom" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="flex-1">
              <Label htmlFor="dateTo">To</Label>
              <Input id="dateTo" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="flex-1">
              <Label htmlFor="method">Payment Method</Label>
              <select
                id="method"
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground"
              >
                <option value="">All</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>
            <Button
              variant="outline"
              onClick={() => { setDateFrom(''); setDateTo(''); setMethodFilter(''); }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">₱{totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Tax Collected</p>
            <p className="text-2xl font-bold">₱{totalTax.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Receipt className="mb-3 h-12 w-12" />
              <p className="text-lg font-medium">No sales found</p>
              <p className="text-sm">Adjust filters or complete a sale first</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(sale => (
                    <TableRow key={sale.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {new Date(sale.createdAt).toLocaleDateString()}<br />
                        <span className="text-xs text-muted-foreground">{new Date(sale.createdAt).toLocaleTimeString()}</span>
                      </TableCell>
                      <TableCell className="text-sm">{sale.items.length} item(s)</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{sale.paymentMethod.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="text-right">₱{sale.subtotal.toFixed(2)}</TableCell>
                      <TableCell className="text-right">₱{sale.tax.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">₱{sale.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setViewingSale(sale)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sale Detail Dialog */}
      <Dialog open={!!viewingSale} onOpenChange={() => setViewingSale(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
          </DialogHeader>
          {viewingSale && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">{new Date(viewingSale.createdAt).toLocaleString()}</p>
              <Separator />
              <div className="space-y-2">
                {viewingSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>₱{viewingSale.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax ({viewingSale.taxRate}%)</span><span>₱{viewingSale.tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">₱{viewingSale.total.toFixed(2)}</span></div>
              </div>
              <Separator />
              <p className="text-center text-muted-foreground">Payment: {viewingSale.paymentMethod.toUpperCase()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
