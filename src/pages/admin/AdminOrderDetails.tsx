import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Loader2, Package, MapPin, ChevronLeft, Truck, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { orderService, type Order, type OrderItem } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Status update states
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [location, setLocation] = useState('');

  // Shipment states
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const statusOptions = [
    'PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'ORDER_CONFIRMED', 
    'JEWELLERY_PREPARING', 'QUALITY_CHECK', 'PACKED', 
    'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 
    'CANCELLED', 'RETURNED'
  ];

  const fetchOrder = async () => {
    try {
      if (!id) return;
      const data = await orderService.getOrderById(id);
      setOrder(data);
      setNewStatus(data.status);
    } catch (err) {
      console.error('Failed to fetch order', err);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newStatus) return;
    
    setIsUpdating(true);
    try {
      await orderService.updateOrderStatus(id, newStatus, remarks, location);
      toast.success('Order status updated successfully');
      setRemarks('');
      setLocation('');
      await fetchOrder();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !courierName || !trackingNumber) return;

    setIsUpdating(true);
    try {
      await orderService.createShipment(id, {
        courierName,
        trackingNumber,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : undefined
      });
      toast.success('Shipment details added');
      await fetchOrder();
    } catch (err) {
      toast.error('Failed to add shipment details');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Order Details">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order Not Found">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-white font-serif mb-2">Order not found</h3>
          <Link to="/admin/orders" className="text-gold hover:underline">Back to Orders</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Manage Order #${order.orderNumber}`}>
      <div className="mb-6">
        <Link to="/admin/orders" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Management Actions */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Update Status Card */}
          <div className="bg-charcoal p-6 rounded border border-white/5 shadow-lg">
            <h3 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold" /> Update Status
            </h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">New Status</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-gold focus:outline-none"
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Location (Optional)</label>
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai Hub"
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Remarks (Optional)</label>
                <textarea 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Note for the customer..."
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-gold focus:outline-none min-h-[80px]"
                />
              </div>
              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full bg-gold text-charcoal font-medium py-2 rounded text-sm hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Order Status
              </button>
            </form>
          </div>

          {/* Shipment Details Card */}
          <div className="bg-charcoal p-6 rounded border border-white/5 shadow-lg">
            <h3 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gold" /> Shipment Details
            </h3>
            {order.trackingNumber ? (
              <div className="space-y-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-400">Courier Name</span>
                  <span className="text-white">{order.courierName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400">Tracking Number</span>
                  <span className="text-white">{order.trackingNumber}</span>
                </div>
                {order.estimatedDeliveryDate && (
                  <div className="flex flex-col">
                    <span className="text-gray-400">Estimated Delivery</span>
                    <span className="text-gold">{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</span>
                  </div>
                )}
                {/* Note: Can add an edit button here to change shipment details if needed */}
              </div>
            ) : (
              <form onSubmit={handleCreateShipment} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Courier Name *</label>
                  <input 
                    type="text"
                    required
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tracking Number *</label>
                  <input 
                    type="text"
                    required
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Est. Delivery Date</label>
                  <input 
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isUpdating || !courierName || !trackingNumber}
                  className="w-full bg-white/10 text-white font-medium py-2 rounded text-sm hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  Save Shipment Info
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Order Info */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="bg-charcoal p-6 rounded border border-white/5">
              <h3 className="text-lg font-serif text-white mb-4">Customer Details</h3>
              <p className="text-sm text-gray-300">ID: {order.customerId}</p>
              {/* If address is populated, show it here */}
              <p className="text-sm text-gray-400 mt-2">Address details would go here if joined.</p>
            </div>

            {/* Financials */}
            <div className="bg-charcoal p-6 rounded border border-white/5 text-sm">
              <h3 className="text-lg font-serif text-white mb-4">Financial Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Making Charges:</span>
                  <span className="text-white">{formatPrice(order.makingCharges)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">GST:</span>
                  <span className="text-white">{formatPrice(order.gstAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping:</span>
                  <span className="text-white">{formatPrice(order.shippingAmount || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="text-white font-medium">Total:</span>
                  <span className="text-gold font-bold">{formatPrice(order.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-charcoal p-6 rounded border border-white/5">
            <h3 className="text-lg font-serif text-white mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs uppercase">
                    <th className="pb-3 pr-4 font-medium">Item</th>
                    <th className="pb-3 px-4 font-medium">SKU</th>
                    <th className="pb-3 px-4 font-medium text-right">Qty</th>
                    <th className="pb-3 pl-4 font-medium text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {order.items?.map((item: OrderItem) => (
                    <tr key={item.id}>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black/40 rounded flex-shrink-0">
                            {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded" />}
                          </div>
                          <span className="text-white font-medium">{item.productName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-400">{item.sku || '-'}</td>
                      <td className="py-4 px-4 text-right text-gray-300">{item.quantity}</td>
                      <td className="py-4 pl-4 text-right text-gold">{formatPrice(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* History */}
          <div className="bg-charcoal p-6 rounded border border-white/5">
            <h3 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-gold" /> Status History
            </h3>
            <div className="space-y-4">
              {order.statusHistory?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((history, idx) => (
                <div key={history.id} className={`flex gap-4 ${idx !== 0 ? 'opacity-60' : ''}`}>
                  <div className="mt-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'bg-gray-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{history.status.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(history.createdAt).toLocaleString()}</p>
                    {history.description && <p className="text-sm text-gray-400 mt-1">{history.description}</p>}
                    {history.location && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> {history.location}</p>}
                  </div>
                </div>
              ))}
              {(!order.statusHistory || order.statusHistory.length === 0) && (
                <p className="text-gray-500 text-sm italic">No history recorded yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
