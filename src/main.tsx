import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import CategoryPage from './pages/CategoryPage.tsx'
import ProductPage from './pages/ProductPage.tsx'
import CartPage from './pages/CartPage.tsx'
import CollectionPage from './pages/CollectionPage.tsx'
import CollectionsPage from './pages/CollectionsPage.tsx'
import ProductDetailPage from './pages/ProductDetailPage.tsx'
import WishlistPage from './pages/WishlistPage.tsx'
import SearchPage from './pages/SearchPage.tsx'
import CheckoutAddressPage from './pages/CheckoutAddressPage.tsx'
import CheckoutPaymentPage from './pages/CheckoutPaymentPage.tsx'
import PaymentGatewayPage from './pages/PaymentGatewayPage.tsx'
import OrderSuccessPage from './pages/OrderSuccessPage.tsx'
import PaymentFailedPage from './pages/PaymentFailedPage.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import { ProtectedRoute } from './auth/ProtectedRoute.tsx'

import Login from './pages/auth/Login.tsx'
import Register from './pages/auth/Register.tsx'
import ForgotPassword from './pages/auth/ForgotPassword.tsx'
import ResetPassword from './pages/auth/ResetPassword.tsx'

import Profile from './pages/account/Profile.tsx'
import Orders from './pages/account/Orders.tsx'
import OrderDetails from './pages/account/OrderDetails.tsx'
import Wishlist from './pages/account/Wishlist.tsx'
import Addresses from './pages/account/Addresses.tsx'
import ChangePassword from './pages/account/ChangePassword.tsx'
import Reviews from './pages/account/Reviews.tsx'

import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import AdminOrders from './pages/admin/AdminOrders.tsx'
import AdminOrderDetails from './pages/admin/AdminOrderDetails.tsx'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:slug" element={<CollectionPage />} />
            <Route path="/collections/:slug/product/:productId" element={<ProductDetailPage />} />
            <Route path="/collection/:slug" element={<CollectionPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout/shipping" element={<CheckoutAddressPage />} />
            <Route path="/checkout/payment" element={<CheckoutPaymentPage />} />
            <Route path="/checkout/gateway" element={<PaymentGatewayPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/payment-failed" element={<PaymentFailedPage />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/account" element={<Navigate to="/account/profile" replace />} />
            <Route path="/account/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/account/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/account/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/account/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/account/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
            <Route path="/account/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/account/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
            
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/orders/:id" element={<ProtectedRoute adminOnly><AdminOrderDetails /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors theme="dark" />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
