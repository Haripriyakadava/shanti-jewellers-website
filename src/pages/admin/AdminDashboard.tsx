import { useEffect, useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Package, IndianRupee, Clock, Truck, Loader2 } from 'lucide-react';
import { orderService, type Order } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getAllOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch admin orders', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysOrders = orders.filter(o => new Date(o.createdAt) >= today);
  const revenue = orders.filter(o => o.paymentStatus === 'COMPLETED' || o.paymentStatus === 'CAPTURED' || o.paymentStatus === 'SUCCESS').reduce((acc, curr) => acc + Number(curr.grandTotal), 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING_PAYMENT' || o.status === 'ORDER_CONFIRMED' || o.status === 'JEWELLERY_PREPARING' || o.status === 'QUALITY_CHECK');
  const inProgress = orders.filter(o => o.status === 'PACKED' || o.status === 'SHIPPED' || o.status === 'OUT_FOR_DELIVERY');

  const stats = [
    { label: "Today's Orders", value: todaysOrders.length.toString(), icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: "Orders in Progress", value: inProgress.length.toString(), icon: Truck, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: "Total Revenue", value: formatPrice(revenue), icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: "Pending Processing", value: pendingOrders.length.toString(), icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-charcoal border border-white/5 p-6 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <h3 className="text-2xl font-serif text-white">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-charcoal border border-white/5 rounded-lg p-6">
        <h3 className="text-lg font-serif text-white mb-6">Recent Orders Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white text-sm">{order.orderNumber}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gold text-sm font-medium">{formatPrice(order.grandTotal)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-[10px] uppercase tracking-wider rounded-full bg-white/10 text-white border border-white/20">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
