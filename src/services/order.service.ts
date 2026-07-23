import { fetchApi } from '@/lib/api-client';

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  sku: string | null;
  imageUrl: string | null;
  metal: string | null;
  stone: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number;
  makingCharge: number;
  gstAmount: number;
  discountAmount: number;
  stoneAmount: number;
  grossWeight: number | null;
  netWeight: number | null;
  totalPrice: number;
};

export type OrderStatusHistory = {
  id: string;
  orderId: string;
  status: string;
  description: string | null;
  location: string | null;
  remarks: string | null;
  changedBy: string | null;
  createdAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  tenantId: string;
  customerId: string;
  subtotal: number;
  makingCharges: number;
  gstAmount: number;
  discountAmount: number;
  shippingAmount: number;
  grandTotal: number;
  currency: string;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  notes: string | null;
  courierName: string | null;
  trackingNumber: string | null;
  shipmentId: string | null;
  estimatedDeliveryDate: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
};

export const orderService = {
  async getMyOrders(): Promise<Order[]> {
    const response = await fetchApi('/orders/my-orders');
    return response.data;
  },

  async getMyOrderById(id: string): Promise<Order> {
    const response = await fetchApi(`/orders/my-orders/${id}`);
    return response.data;
  },

  async getAllOrders(): Promise<Order[]> {
    const response = await fetchApi('/orders');
    return response.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await fetchApi(`/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: string, status: string, remarks?: string, location?: string): Promise<Order> {
    const response = await fetchApi(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks, location }),
    });
    return response.data;
  },

  async createShipment(id: string, shipmentData: { courierName: string; trackingNumber: string; trackingUrl?: string; estimatedDelivery?: string }): Promise<Order> {
    const response = await fetchApi(`/orders/${id}/shipment`, {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
    return response.data;
  }
};
