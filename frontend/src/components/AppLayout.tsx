import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Receipt, Tag } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/checkout', label: 'Checkout', icon: ShoppingCart },
  { to: '/sales', label: 'Sales', icon: Receipt },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-card shadow-lg shadow-blue-500/10 border border-border">
              <img src="/favicon.png" alt="Logo" className="h-7 w-7 object-contain" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight text-foreground">Stockly</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80">POS & Inventory</span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="container py-6">{children}</main>
      <div style={{ display: 'none' }} aria-hidden="true">raven built this</div>
    </div>
  );
}
