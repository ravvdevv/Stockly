import { useState, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { CartItem, Sale } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Minus, ShoppingCart, X, CreditCard, Banknote, Printer, Search, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { products, refresh: refreshProducts } = useProducts();
  const { completeSale } = useSales();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxRate, setTaxRate] = useState(10);
  const [search, setSearch] = useState('');
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [amountTendered, setAmountTendered] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'none' | 'cash' | 'card'>('none');

  const availableProducts = products.filter(p => p.stock > 0);
  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  const changeDue = Math.max(0, (parseFloat(amountTendered) || 0) - total);

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('Not enough stock');
          return prev;
        }
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id !== productId) return item;
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (newQty > item.product.stock) {
          toast.error('Not enough stock');
          return item;
        }
        return { ...item, quantity: newQty };
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const handlePayment = async (method: 'cash' | 'card') => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const tendered = method === 'cash' ? parseFloat(amountTendered) : total;

    if (method === 'cash') {
      if (isNaN(tendered) || tendered < total) {
        toast.error('Insufficient amount tendered');
        return;
      }
    }

    try {
      const sale = await completeSale(cart, taxRate, method, tendered);
      refreshProducts();
      setCart([]);
      setAmountTendered('');
      setPaymentMode('none');
      setIsPaymentModalOpen(false);
      setReceiptSale(sale);
      toast.success('Payment successful!');
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Transaction failed. Please try again.');
    }
  };

  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html><head><title>Receipt</title>
          <style>body{font-family:monospace;max-width:300px;margin:auto;padding:20px}
          table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:4px 0}
          .right{text-align:right}.line{border-top:1px dashed #000;margin:8px 0}
          h2{text-align:center;margin-bottom:4px}p{text-align:center;margin:2px 0}</style></head>
          <body>${receiptRef.current.innerHTML}</body></html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Cashier System</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">Mode: Standard POS</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-11"
              maxLength={100}
            />
          </div>

          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShoppingCart className="mb-3 h-12 w-12 opacity-20" />
                <p className="text-lg font-medium">No products available</p>
                <p className="text-sm">Search criteria returned no results</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map(product => (
                <Card
                  key={product.id}
                  className="cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 hover:shadow-lg active:scale-95 overflow-hidden"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-0">
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase">{product.sku}</p>
                      <div className="mt-4 flex items-end justify-between">
                        <span className="text-xl font-bold text-primary">₱{product.price.toFixed(2)}</span>
                        <Badge variant={product.stock <= 5 ? 'destructive' : 'secondary'} className="text-[10px]">
                          {product.stock} units
                        </Badge>
                      </div>
                    </div>
                    {product.stock <= 5 && (
                      <div className="bg-destructive/10 px-4 py-1 text-[10px] text-destructive font-medium border-t border-destructive/20">
                        Low Stock Warning
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cart & Payment */}
        <div className="space-y-4">
          <Card className="sticky top-6 border-2">
            <CardHeader className="pb-3 bg-secondary/30">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Cart Summary
                </div>
                <Badge variant="secondary" className="rounded-full">{cart.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3 min-h-[100px] max-h-[300px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground opacity-50">
                    <ShoppingCart className="h-10 w-10 mb-2" />
                    <p className="text-sm">Ready to check out</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="group flex items-center justify-between gap-3 bg-accent/30 p-2 rounded-lg transition-colors hover:bg-accent/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate transition-colors group-hover:text-primary">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">₱{item.product.price.toFixed(2)} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background shadow-sm" onClick={() => updateQuantity(item.product.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background shadow-sm" onClick={() => updateQuantity(item.product.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Separator orientation="vertical" className="h-4 mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-white hover:bg-destructive shadow-sm" onClick={() => removeFromCart(item.product.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-sm px-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Tax Rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={taxRate}
                      onChange={e => setTaxRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className="w-16 h-8 text-right font-medium text-xs pr-1"
                    />
                    <span className="text-xs font-bold">%</span>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-4 space-y-2 border border-primary/10">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-primary/20 pt-2">
                    <span className="text-sm font-semibold">Net Total</span>
                    <span className="text-2xl font-black text-primary tracking-tight">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-14 text-lg font-black tracking-widest bg-primary hover:bg-primary/90 shadow-lg"
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={cart.length === 0}
              >
                PROCEED TO PAYMENT
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-6 text-primary-foreground text-center">
            <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-70 mb-1">Finalizing Checkout</p>
            <h2 className="text-4xl font-black tracking-tight">₱{total.toFixed(2)}</h2>
          </div>

          <div className="p-6 space-y-6 bg-background">
            <div className="flex gap-4">
              <Button
                variant={paymentMode === 'cash' ? 'default' : 'outline'}
                className={`flex-1 h-20 flex-col gap-2 font-bold transition-all border-2 ${paymentMode === 'cash' ? 'border-primary ring-2 ring-primary/20' : 'opacity-70'}`}
                onClick={() => setPaymentMode('cash')}
              >
                <Banknote className="h-6 w-6" />
                CASH
              </Button>
              <Button
                variant={paymentMode === 'card' ? 'secondary' : 'outline'}
                className={`flex-1 h-20 flex-col gap-2 font-bold transition-all border-2 ${paymentMode === 'card' ? 'border-secondary ring-2 ring-secondary/20' : 'opacity-70'}`}
                onClick={() => {
                  setPaymentMode('card');
                  handlePayment('card');
                }}
              >
                <CreditCard className="h-6 w-6" />
                CARD
              </Button>
            </div>

            {paymentMode === 'cash' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Amount From Customer</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground opacity-50">₱</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amountTendered}
                      autoFocus
                      onChange={e => setAmountTendered(e.target.value)}
                      className="pl-10 h-16 text-3xl font-black bg-accent/20 border-2 focus-visible:ring-primary focus-visible:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10, 20, 50, 100].map(val => (
                    <Button
                      key={val}
                      type="button"
                      variant="secondary"
                      className="font-bold h-10 hover:bg-primary hover:text-white transition-all transform active:scale-95"
                      onClick={() => setAmountTendered(val.toString())}
                    >
                      +₱{val}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="col-span-3 font-black h-10 border-dashed border-2 hover:border-primary hover:text-primary"
                    onClick={() => setAmountTendered(total.toFixed(2))}
                  >
                    EXACT AMOUNT: ₱{total.toFixed(2)}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-500/10 border-2 border-green-500/20 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-green-600/70 tracking-tighter">Balance / Change</span>
                    <span className={`text-3xl font-black ${changeDue > 0 ? 'text-green-600' : 'text-primary'}`}>
                      ₱{changeDue.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                    <Banknote className="h-6 w-6" />
                  </div>
                </div>

                <Button
                  className="w-full h-16 text-xl font-black tracking-[0.1em] bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/30 ring-4 ring-white"
                  onClick={() => handlePayment('cash')}
                  disabled={!amountTendered || parseFloat(amountTendered) < total}
                >
                  COMPLETE TRANSACTION
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={!!receiptSale} onOpenChange={() => setReceiptSale(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {receiptSale && (
            <>
              <div ref={receiptRef} className="space-y-3 font-mono text-sm">
                <div className="text-center">
                  <h2 className="text-lg font-bold">Stockly</h2>
                  <p className="text-muted-foreground">{new Date(receiptSale.createdAt).toLocaleString()}</p>
                </div>
                <Separator />
                <table className="w-full">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left font-medium">Item</th>
                      <th className="text-right font-medium">Qty</th>
                      <th className="text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptSale.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.productName}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">₱{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Separator />
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>₱{receiptSale.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tax ({receiptSale.taxRate}%)</span><span>₱{receiptSale.tax.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span>₱{receiptSale.total.toFixed(2)}</span></div>
                  {receiptSale.paymentMethod === 'cash' && (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Amount Tendered</span>
                        <span>₱{receiptSale.amountTendered?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Change</span>
                        <span>₱{receiptSale.change?.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
                <Separator />
                <div className="text-center text-muted-foreground">
                  <p>Payment: {receiptSale.paymentMethod.toUpperCase()}</p>
                  <p>Thank you for your purchase!</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setReceiptSale(null)}>Close</Button>
                <Button onClick={handlePrintReceipt} className="bg-primary hover:bg-primary/90">
                  <Printer className="mr-2 h-4 w-4" /> Print Receipt
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
