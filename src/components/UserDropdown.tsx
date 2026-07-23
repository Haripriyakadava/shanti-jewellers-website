import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LayoutDashboard, ShoppingBag, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 sm:p-2 hover:text-gold transition-colors flex items-center gap-2 rounded-full focus:outline-none focus:ring-1 focus:ring-gold"
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
          {currentUser?.profile_image ? (
            <img src={currentUser.profile_image} alt={currentUser.full_name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-gray-300" />
          )}
        </div>
        <span className="hidden sm:inline-block text-sm font-medium max-w-[100px] truncate">
          {currentUser?.full_name?.split(' ')[0] || 'Account'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-charcoal-light border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 py-1">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-medium text-white truncate">{currentUser?.full_name}</p>
            <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
          </div>
          
          <div className="py-1">
            <Link
              to="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-gold transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/account/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-gold transition-colors"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            <Link
              to="/account/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-gold transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              My Orders
            </Link>
            <Link
              to="/account/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-gold transition-colors"
            >
              <Heart className="w-4 h-4" />
              Wishlist
            </Link>
          </div>
          
          <div className="py-1 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
