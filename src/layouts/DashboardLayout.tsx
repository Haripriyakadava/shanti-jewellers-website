import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingBag, Heart, MapPin, LogOut, Star } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { SeoHead } from '../components/SeoHead';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  noBackground?: boolean;
}

export function DashboardLayout({ children, title, noBackground }: DashboardLayoutProps) {
  const location = useLocation();
  const { logout, currentUser } = useAuth();
  
  const sidebarGroups = [
    {
      title: 'My Account',
      items: [
        { name: 'Account Details', path: '/account/profile', icon: User },
        { name: 'Order History', path: '/account/orders', icon: ShoppingBag },
        { name: 'My Wishlist', path: '/account/wishlist', icon: Heart },
        { name: 'My Reviews and Ratings', path: '/account/reviews', icon: Star },
        { name: 'Saved Addresses', path: '/account/addresses', icon: MapPin },
      ]
    }
  ];

  return (
    <>
      <SeoHead />
      <Navbar />
      <div className="min-h-screen bg-charcoal pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <div className="px-1">
              <h1 className="text-2xl font-serif text-gold">{currentUser?.full_name}</h1>
              <p className="text-sm text-gray-400 mt-1">{currentUser?.email}</p>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-72 flex-shrink-0">

              <div className="bg-charcoal-light rounded-lg border border-white/5 overflow-hidden sticky top-28">
                <nav className="flex flex-col">
                  {sidebarGroups.map((group, groupIdx) => (
                    <div key={group.title} className={groupIdx > 0 ? "border-t border-white/5 pt-4" : "pt-4"}>
                      <h3 className="px-6 mb-2 text-lg font-serif text-white">{group.title}</h3>
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-l-2 ${
                              isActive 
                                ? 'border-gold bg-gold/10 text-gold' 
                                : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 border-t border-white/5">
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-3 px-6 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <div className={`min-h-[500px] ${noBackground ? '' : 'bg-charcoal-light rounded-lg border border-white/5 p-6 sm:p-8'}`}>
                {title && (
                  <h2 className="text-2xl font-serif text-white mb-6 pb-4 border-b border-white/10">
                    {title}
                  </h2>
                )}
                {children}
              </div>
            </div>
          </div>
          
        </div>
      </div>
      <Footer />
    </>
  );
}
