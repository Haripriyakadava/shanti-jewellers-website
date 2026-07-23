import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { CheckCircle, ShoppingBag, FileText, Truck, User, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getItem, StorageKeys } from '@/auth/storage';
import { getCurrentTenantId } from '@/lib/tenant';

// Format currency
const formatPrice = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

// Date formatter
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!orderId) {
      navigate('/', { replace: true });
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const tenantId = await getCurrentTenantId();
        const token = getItem<string>(StorageKeys.ACCESS_TOKEN) || 'test-token';

        const response = await fetch(`http://localhost:5000/api/payments/order/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant-id': tenantId
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const json = await response.json();
        setPaymentData(json.data);

        // Fetch temporary address from local storage since the backend prototype doesn't link address to order
        const savedAddresses = getItem<any[]>(StorageKeys.ADDRESSES) || [];
        const selectedId = getItem<string>('checkout_delivery_address_id');
        if (selectedId && savedAddresses.length > 0) {
           const addr = savedAddresses.find(a => a.id === selectedId);
           if (addr) setDeliveryAddress(addr);
        }

      } catch (err) {
        setError('Could not load full order details. However, your order was placed successfully.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const order = paymentData?.order;
  const items = order?.items || [];
  
  // Stagger variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Success Header */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center border-t-4 border-[#D4AF37]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"
          >
            <CheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4 tracking-tight font-bold">
            Payment Successful
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Thank you for your purchase! Your order has been placed successfully and is now being processed.
          </p>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm text-center">
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Details Column */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-serif font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                Order Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-medium text-gray-900 font-mono">{order?.orderNumber || orderId}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-semibold text-gray-900 text-lg">
                    {formatPrice(order?.grandTotal || paymentData?.grandTotal || paymentData?.subtotal || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-500">Order Date</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(order?.createdAt || paymentData?.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-500">Order Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-wide">
                    {order?.status || 'CONFIRMED'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Estimated Delivery</span>
                  <span className="font-medium text-gray-900">
                    {/* Add 5 days for estimate */}
                    {formatDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString())}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-serif font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                Payment Details
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="font-medium text-gray-900 font-mono text-sm break-all text-right ml-4">
                    {paymentData?.razorpayPaymentId || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-medium text-gray-900">
                    {paymentData?.method || 'Razorpay'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-500">Payment Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-wide">
                    {paymentData?.status || 'PAID'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Currency</span>
                  <span className="font-medium text-gray-900">INR</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Items & Shipping Column */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-serif font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                Purchased Items
              </h2>
              
              <div className="space-y-6">
                {items.length > 0 ? items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{item.productName}</h4>
                      <div className="text-xs text-gray-500 space-y-1 mb-2">
                        {item.metal && <p>Metal: {item.metal}</p>}
                        {item.size && item.size !== 'N/A' && <p>Size: {item.size}</p>}
                        {item.grossWeight && <p>Weight: {Number(item.grossWeight).toFixed(2)}g</p>}
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <div className="font-semibold text-[#D4AF37]">
                        {formatPrice(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 italic text-sm">Items details unavailable at this time.</p>
                )}
              </div>
            </div>

            {deliveryAddress && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-xl font-serif font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#D4AF37]" />
                  Shipping Address
                </h2>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {deliveryAddress.fullName}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{deliveryAddress.phone}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {deliveryAddress.street}<br/>
                    {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zip}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button 
            onClick={() => navigate('/')}
            className="h-14 px-8 text-base bg-[#D4AF37] hover:bg-[#b8952b] text-white shadow-lg rounded-xl font-medium"
          >
            Continue Shopping
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/account/orders')}
            className="h-14 px-8 text-base border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium flex items-center gap-2"
          >
            <Truck className="w-5 h-5" />
            Track Order
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => window.print()}
            className="h-14 px-8 text-base text-[#D4AF37] hover:bg-yellow-50 hover:text-[#b8952b] rounded-xl font-medium flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Download Invoice
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
