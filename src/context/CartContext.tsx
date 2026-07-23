import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getTenantStorageNamespace } from '@/lib/tenant';
import { authService } from '@/auth/authService';
import { cartService } from '@/services/cart.service';

export type CartSelection = {
  metal: string;
  carat: number;
  diamondType: string;
  size: string;
};

export type CartItem = {
  key: string;
  productId: number;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  selection: CartSelection;
};

type AddToCartPayload = {
  productId: number;
  name: string;
  image: string;
  unitPrice: number;
  quantity?: number;
  selection: CartSelection;
};

type CartContextValue = {
  cartItems: CartItem[];
  totalItems: number;
  subtotal: number;
  addToCart: (payload: AddToCartPayload) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  removeFromCart: (itemKey: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = 'aurum-cart-v1';

function getScopedStorageKey() {
  return `${STORAGE_KEY}:${getTenantStorageNamespace()}`;
}

const CartContext = createContext<CartContextValue | null>(null);

const createItemKey = (payload: AddToCartPayload) => {
  const { productId, selection } = payload;
  return [productId, selection.metal, selection.carat, selection.diamondType, selection.size].join('|');
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(getScopedStorageKey());
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(getScopedStorageKey(), JSON.stringify(cartItems));
  }, [cartItems]);

  // Initial load logic
  useEffect(() => {
    let isMounted = true;
    const initCart = async () => {
      if (authService.isAuthenticated()) {
        try {
          const backendCart = await cartService.getCart();
          if (isMounted && backendCart.items) {
            const mappedItems = backendCart.items.map(item => ({
              key: item.id, // Use backend id as key
              productId: Number(item.productId),
              name: item.productName || 'Unknown',
              image: item.productImage || '',
              unitPrice: Number(item.totalPrice) / (item.quantity || 1),
              quantity: item.quantity,
              selection: { metal: 'Gold', carat: 18, diamondType: 'VVS', size: '12' } // Dummy selection for now
            }));
            setCartItems(mappedItems);
            // Overwrite local storage to sync
            window.localStorage.setItem(getScopedStorageKey(), JSON.stringify(mappedItems));
          }
        } catch (error) {
          console.error('Failed to load backend cart:', error);
        }
      }
    };
    initCart();
    
    return () => { isMounted = false; };
  }, []);

  const addToCart = async (payload: AddToCartPayload) => {
    const nextKey = createItemKey(payload);
    const nextQuantity = payload.quantity ?? 1;

    if (authService.isAuthenticated()) {
      try {
        const addedItem = await cartService.addToCart(payload.productId, nextQuantity);
        setCartItems((previous) => {
          // If we already have this product in local state, update it (though backend just gave us the updated item)
          // For simplicity, we just trigger a full fetch or carefully update.
          const existing = previous.find(i => Number(i.productId) === payload.productId);
          if (existing) {
             return previous.map(i => Number(i.productId) === payload.productId ? { ...i, quantity: i.quantity + nextQuantity, key: addedItem.id } : i);
          }
          return [...previous, {
            key: addedItem.id,
            productId: payload.productId,
            name: payload.name,
            image: payload.image,
            unitPrice: Number(addedItem.totalPrice) / (addedItem.quantity || 1),
            quantity: nextQuantity,
            selection: payload.selection,
          }];
        });
      } catch (error) {
        console.error('Failed to add to backend cart:', error);
        // Optionally show toast error
        throw error;
      }
    } else {
      setCartItems((previous) => {
        const existing = previous.find((item) => item.key === nextKey);
        if (existing) {
          return previous.map((item) =>
            item.key === nextKey ? { ...item, quantity: item.quantity + nextQuantity } : item,
          );
        }

        return [
          ...previous,
          {
            key: nextKey,
            productId: payload.productId,
            name: payload.name,
            image: payload.image,
            unitPrice: payload.unitPrice,
            quantity: nextQuantity,
            selection: payload.selection,
          },
        ];
      });
    }
  };

  const updateQuantity = async (itemKey: string, quantity: number) => {
    if (authService.isAuthenticated()) {
      try {
        if (quantity <= 0) {
          await cartService.removeCartItem(itemKey);
          setCartItems((previous) => previous.filter((item) => item.key !== itemKey));
        } else {
          await cartService.updateCartItem(itemKey, quantity);
          setCartItems((previous) => previous.map((item) => (item.key === itemKey ? { ...item, quantity } : item)));
        }
      } catch (error) {
        console.error('Failed to update backend cart:', error);
      }
    } else {
      if (quantity <= 0) {
        setCartItems((previous) => previous.filter((item) => item.key !== itemKey));
        return;
      }

      setCartItems((previous) =>
        previous.map((item) => (item.key === itemKey ? { ...item, quantity } : item)),
      );
    }
  };

  const removeFromCart = async (itemKey: string) => {
    if (authService.isAuthenticated()) {
      try {
        await cartService.removeCartItem(itemKey);
      } catch (error) {
        console.error('Failed to remove from backend cart:', error);
      }
    }
    setCartItems((previous) => previous.filter((item) => item.key !== itemKey));
  };

  const clearCart = async () => {
    if (authService.isAuthenticated()) {
      try {
        await cartService.clearCart();
      } catch (error) {
        console.error('Failed to clear backend cart:', error);
      }
    }
    setCartItems([]);
  };

  const value = useMemo(() => {
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

    return {
      cartItems,
      totalItems,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    };
  }, [cartItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
