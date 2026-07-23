import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Package, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderService, type Order } from '@/services/order.service';
import { toast } from 'sonner';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm] = useState('');
  const [statusFilter] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
        setFilteredOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
        toast.error('Failed to load your orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;
    
    if (searchTerm) {
      result = result.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      const dbStatusMap: Record<string, string> = {
        'Pending': 'PENDING_PAYMENT',
        'Confirmed': 'ORDER_CONFIRMED',
        'Preparing': 'JEWELLERY_PREPARING',
        'Packed': 'PACKED',
        'Shipped': 'SHIPPED',
        'Out for Delivery': 'OUT_FOR_DELIVERY',
        'Delivered': 'DELIVERED',
        'Cancelled': 'CANCELLED',
        'Returned': 'RETURNED'
      };
      const dbStatus = dbStatusMap[statusFilter];
      if (dbStatus) {
        result = result.filter(order => order.status === dbStatus || order.status === statusFilter.toUpperCase());
      }
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  if (loading) {
    return (
      <DashboardLayout noBackground={true}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout noBackground={true}>


      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 border border-white/5 rounded-lg bg-charcoal-light">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white font-serif mb-2">No orders found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isDelivered = order.status === 'DELIVERED';
            const statusColor = isDelivered ? 'bg-green-500' : 'bg-gold';
            
            return (
              <div key={order.id} className="bg-charcoal-light border border-white/5 rounded-lg overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row justify-between md:items-start gap-4">
                  
                  {/* Left Side: Status */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-full flex-shrink-0 ${statusColor} bg-opacity-20 flex items-center justify-center`}>
                      <div className={`w-4 h-4 rounded-full ${statusColor}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-lg font-medium capitalize truncate ${isDelivered ? 'text-green-400' : 'text-gold'}`}>
                        {order.status.replace(/_/g, ' ').toLowerCase()}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1 truncate">
                        {order.estimatedDeliveryDate 
                          ? `Expected Delivery - ${new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : (isDelivered ? `Delivered on - ${new Date(order.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Processing')}
                      </p>
                      
                      <div className="mt-6">
                        <Link 
                          to={`/account/orders/${order.id}`}
                          className="inline-block px-6 py-2 bg-gold text-charcoal font-medium text-sm rounded hover:bg-gold/90 transition-colors"
                        >
                          View Order Details
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Order Info */}
                  <div className="md:text-right mt-4 md:mt-0 text-sm space-y-1 min-w-0 w-full md:w-auto md:max-w-[35%]">
                    <p className="text-white font-medium break-all md:break-words">
                      Order ID : <span className="break-all">{order.orderNumber}</span>
                    </p>
                    <p className="text-gray-400">
                      Order placed on - {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
