import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Loader2, Package, CreditCard, ChevronLeft, Download, ExternalLink, Home, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { orderService, type Order } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) return;
        const data = await orderService.getMyOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order', err);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Order Details">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout title="Order Not Found">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-white font-serif mb-2">Order not found</h3>
          <Link to="/account/orders" className="text-gold hover:underline">
            Back to My Orders
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const timelineSteps = [
    { key: 'PENDING_PAYMENT', label: 'Order Placed' },
    { key: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed' },
    { key: 'ORDER_CONFIRMED', label: 'Order Confirmed' },
    { key: 'JEWELLERY_PREPARING', label: 'Jewellery Preparing' },
    { key: 'QUALITY_CHECK', label: 'Quality Check' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const currentStatusIndex = timelineSteps.findIndex(s => s.key === order.status);

  return (
    <DashboardLayout title={`Order #${order.orderNumber}`}>
      <div className="mb-6 flex justify-between items-center">
        <Link to="/account/orders" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>

      <div className="bg-charcoal-light border border-white/5 rounded-lg overflow-hidden">
        {/* Header section (Status and Order ID) */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between md:items-start gap-4 border-b border-white/5">
          {/* Left Side: Status */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex-shrink-0 ${currentStatusIndex === timelineSteps.length - 1 ? 'bg-green-500' : 'bg-gold'} bg-opacity-20 flex items-center justify-center`}>
              <div className={`w-4 h-4 rounded-full ${currentStatusIndex === timelineSteps.length - 1 ? 'bg-green-500' : 'bg-gold'}`} />
            </div>
            <div>
              <h4 className={`text-xl font-medium capitalize ${currentStatusIndex === timelineSteps.length - 1 ? 'text-green-400' : 'text-gold'}`}>
                {order.status.replace(/_/g, ' ').toLowerCase()}
              </h4>
              <div className="text-sm text-gray-400 mt-1 flex flex-wrap items-center gap-2">
                <span>
                  {order.estimatedDeliveryDate 
                    ? `Expected Delivery - ${new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : (currentStatusIndex === timelineSteps.length - 1 ? `Delivered on - ${new Date(order.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Processing')}
                </span>
                {order.trackingNumber && (
                  <>
                    <span className="hidden sm:inline">|</span>
                    <a href="#" className="text-gold hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3"/> Track Order</a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Order Info */}
          <div className="md:text-right mt-4 md:mt-0 text-sm space-y-1 flex-1 md:flex-none min-w-0 md:max-w-[200px] lg:max-w-xs">
            <p className="text-white font-medium break-all">Order ID : {order.orderNumber}</p>
            <p className="text-gray-400">
              Order placed on - {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Body Section (Price & Actions) */}
        <div className="p-6 md:p-8">
          <div className="max-w-xl">
            
            {/* Price Row */}
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-lg text-white font-medium">Total Price</h3>
                {order.discountAmount > 0 && (
                  <p className="text-sm text-gray-400 mt-1">You saved {formatPrice(order.discountAmount)} on this order</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xl text-gold font-medium">{formatPrice(order.grandTotal)}</p>
                <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mt-1 underline transition-colors">
                  View breakup <ChevronLeft className="w-3 h-3 -rotate-90" />
                </button>
              </div>
            </div>

            {/* Payment Method Box */}
            <div className="bg-black/40 border border-white/5 rounded-md p-4 flex items-center gap-3 mb-8">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <span className="text-gray-300 text-sm">
                Paid via {order.paymentStatus === 'COMPLETED' ? 'Razorpay' : order.paymentStatus.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 bg-charcoal border border-white/20 text-white font-medium text-sm rounded hover:bg-white/5 transition-colors flex justify-center items-center gap-2">
                <Download className="w-4 h-4" /> Download Invoice
              </button>
              
              {!showMoreDetails && (
                <button 
                  onClick={() => setShowMoreDetails(true)}
                  className="px-6 py-3 bg-gold text-charcoal font-medium text-sm rounded hover:bg-gold/90 transition-colors flex justify-center items-center"
                >
                  View more Details
                </button>
              )}
            </div>

            {/* Expanded Details Section */}
            {showMoreDetails && (
              <div className="mt-8 space-y-6 border-t border-white/10 pt-8">
                {/* Delivery Address */}
                <div>
                  <h4 className="text-white font-medium mb-4">Delivery Address</h4>
                  <div className="bg-charcoal/50 border border-white/5 p-4 rounded flex items-start gap-4">
                    <div className="p-2 bg-charcoal rounded flex-shrink-0 text-gray-400">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-white font-medium">{currentUser?.full_name || 'Customer'}</h5>
                      <p className="text-sm text-gray-400 mt-1">
                        123 Luxury Lane, Jewelry District<br />
                        Mumbai, Maharashtra - 400001
                      </p>
                    </div>
                  </div>
                </div>

                {/* Updates sent to */}
                <div>
                  <h4 className="text-white font-medium mb-4">Updates sent to</h4>
                  <div className="bg-charcoal/50 border border-white/5 p-4 rounded space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{currentUser?.phone_number || '+91 9876543210'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{currentUser?.email || 'customer@example.com'}</span>
                    </div>
                  </div>
                </div>

                {/* View less Details button */}
                <div className="pt-2">
                  <button 
                    onClick={() => setShowMoreDetails(false)}
                    className="px-6 py-3 bg-gold text-charcoal font-medium text-sm rounded hover:bg-gold/90 transition-colors flex justify-center items-center"
                  >
                    View less Details
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
