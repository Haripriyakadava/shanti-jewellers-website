import { useEffect, useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Loader2, Search, Filter, Edit, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderService, type Order } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filterOptions = [
    'All', 'Pending Payment', 'Payment Confirmed', 'Order Confirmed', 'Jewellery Preparing', 'Quality Check', 'Packed', 'Shipped', 
    'Out For Delivery', 'Delivered', 'Cancelled', 'Returned'
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getAllOrders();
        setOrders(data);
        setFilteredOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
        toast.error('Failed to load orders.');
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
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      const dbStatus = statusFilter.toUpperCase().replace(/ /g, '_');
      result = result.filter(order => order.status === dbStatus);
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  if (loading) {
    return (
      <AdminLayout title="Order Tracking">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Order Tracking Management">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by Order ID or Number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-charcoal border border-white/10 text-white text-sm rounded pl-9 pr-4 py-2 focus:border-gold focus:outline-none transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide max-w-2xl">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0 mr-1" />
          {filterOptions.map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 text-xs whitespace-nowrap rounded-full transition-colors border ${
                statusFilter === filter 
                  ? 'bg-gold/20 text-gold border-gold/30 font-medium' 
                  : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-charcoal border border-white/5 rounded-lg">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg text-white font-serif mb-2">No orders found</h3>
            <p className="text-gray-400 text-sm">No orders match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider bg-black/20">
                  <th className="py-4 px-6 font-medium">Order Number</th>
                  <th className="py-4 px-6 font-medium">Date</th>
                  <th className="py-4 px-6 font-medium">Customer</th>
                  <th className="py-4 px-6 font-medium">Total</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6 text-white font-medium text-sm">{order.orderNumber}</td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-gray-300 text-sm">{/* Could fetch customer details if available */ order.customerId}</td>
                    <td className="py-4 px-6 text-gold text-sm font-medium">{formatPrice(order.grandTotal)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded-full ${
                        order.status === 'DELIVERED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        order.status === 'SHIPPED' || order.status === 'OUT_FOR_DELIVERY' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to={`/admin/orders/${order.id}`} className="text-gray-400 hover:text-gold transition-colors inline-flex items-center gap-1 text-sm bg-black/40 border border-white/5 hover:border-gold/30 px-3 py-1.5 rounded opacity-0 group-hover:opacity-100">
                        <Edit className="w-3.5 h-3.5" /> Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
