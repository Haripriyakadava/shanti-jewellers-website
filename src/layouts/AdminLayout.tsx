import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, LogOut, Settings, Users, Box } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { SeoHead } from '../components/SeoHead';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const location = useLocation();
  const { logout, currentUser } = useAuth();
  
  const sidebarItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Order Tracking', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', path: '/admin/products', icon: Box },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      <SeoHead />
      <div className="min-h-screen bg-[#0F0F0F] flex">
        {/* Sidebar */}
        <aside className="w-64 bg-charcoal border-r border-white/5 flex flex-col hidden md:flex sticky top-0 h-screen">
          <div className="p-6 border-b border-white/5">
            <Link to="/" className="text-xl font-serif text-gold tracking-widest block text-center">
              SHANTI<br/><span className="text-xs text-white tracking-[0.3em]">JEWELLERS</span>
            </Link>
            <div className="mt-4 text-center">
              <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded border border-gold/30">ADMIN PORTAL</span>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-l-2 ${
                    isActive 
                      ? 'border-gold bg-gold/10 text-gold' 
                      : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gold font-serif">
                {currentUser?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm text-white truncate">{currentUser?.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen">
          <header className="bg-charcoal border-b border-white/5 px-8 py-4 flex justify-between items-center sticky top-0 z-10 hidden md:flex">
            <h1 className="text-xl font-serif text-white">{title}</h1>
            <Link to="/" className="text-sm text-gold hover:underline">View Storefront</Link>
          </header>
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
