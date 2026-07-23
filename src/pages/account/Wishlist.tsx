import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Heart, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { removeWishlistItem, getShopStorageEventName } from '@/lib/shop-storage';
import { wishlistService } from '@/services/wishlist.service';
import type { ShopProductCard } from '@/lib/shop-api';
import { authService } from '@/auth/authService';

type WishlistProduct = ShopProductCard & { href: string };

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Wishlist() {
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWishlistProducts = async () => {
    if (!authService.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const backendItems = await wishlistService.getWishlist();
      
      const resolved = backendItems
        .filter((item) => item.product) // Only keep valid products
        .map((item) => {
          const p = item.product;
          return {
            id: Number(p.id),
            slug: p.slug || String(p.id),
            name: p.productName || p.name || 'Unknown Product',
            category: 'Jewellery', // Default fallback
            categorySlug: 'jewellery',
            collectionSlug: null,
            price: Number(p.total_amount || p.base_price || p.basePrice || p.price || 0),
            image: p.imageUrl || p.image_url || p.image || 'https://images.unsplash.com/photo-1599643478524-fb66f70362f6?w=800&q=80',
            hoverImage: p.hoverImageUrl || p.hover_image_url || null,
            rating: Number(p.rating) || 5,
            isNew: Boolean(p.is_new || p.isNew),
            isBestSeller: Boolean(p.is_best_seller || p.isBestSeller),
            engravable: Boolean(p.is_engravable || p.engravable),
            metal: p.metaltype || p.metal || 'Gold',
            createdAt: p.created_at || p.createdAt || new Date().toISOString(),
            reviewsCount: 0,
            href: `/product/${p.id}`
          } satisfies WishlistProduct;
        });

      setWishlistProducts(resolved);
    } catch (err: any) {
      toast.error('Unable to load your wishlist.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      loadWishlistProducts();
    }

    const shopStorageEvent = getShopStorageEventName();
    const handleStorageChange = () => {
      // Re-fetch when storage event fires (e.g., product page added an item)
      loadWishlistProducts();
    };

    window.addEventListener(shopStorageEvent, handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener(shopStorageEvent, handleStorageChange);
    };
  }, []);

  const removeFromWishlist = async (id: string | number) => {
    await removeWishlistItem(id);
    // State is instantly updated via storage event listener triggering reload
    // but we can also manually remove it for snappy UI
    setWishlistProducts(prev => prev.filter(p => p.id !== id));
  };

  if (!authService.isAuthenticated()) {
    return (
      <DashboardLayout title="My Wishlist">
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-white font-serif mb-2">Please Login</h3>
          <p className="text-gray-400">You must be logged in to view your wishlist.</p>
          <div className="mt-6">
            <Link to="/login" className="text-gold hover:text-gold-light transition-colors border border-gold px-4 py-2 rounded">
              Login Now
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="My Wishlist">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Wishlist">
      {wishlistProducts.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-white font-serif mb-2">Your wishlist is empty</h3>
          <p className="text-gray-400">Save items you love to your wishlist to view them later.</p>
          <div className="mt-6">
            <Link to="/" className="text-gold hover:text-gold-light transition-colors border border-gold px-4 py-2 rounded">
              Explore products
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((item) => (
            <div key={item.id} className="bg-charcoal border border-white/10 rounded-lg overflow-hidden group card-luxury">
              <div className="relative h-48 overflow-hidden block">
                <Link to={item.href}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button 
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 p-2 bg-charcoal/80 text-white rounded-full hover:bg-red-500 hover:text-white transition-colors z-10"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <Link to={item.href} className="block">
                  <h4 className="text-white font-medium mb-1 truncate hover:text-gold transition-colors">{item.name}</h4>
                </Link>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gold font-medium">{formatPrice(item.price)}</span>
                  <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">In Stock</span>
                </div>
                <Link to={item.href} className="w-full mt-4 py-2 border border-gold text-gold rounded hover:bg-gold hover:text-charcoal transition-colors text-sm font-medium block text-center">
                  View Product
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
