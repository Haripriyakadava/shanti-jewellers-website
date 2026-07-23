import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, CreditCard, Landmark, Smartphone, Home, Banknote } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { CheckoutHeader } from '@/components/CheckoutHeader';
import { useCart } from '@/context/CartContext';
import { getItem, StorageKeys } from '@/auth/storage';
import { getCurrentTenantId } from '@/lib/tenant';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CheckoutPaymentPage() {
  const navigate = useNavigate();
  const { cartItems, totalItems, subtotal, clearCart } = useCart();
  
  const [selectedMethod, setSelectedMethod] = useState<string>('razorpay');
  const [openAccordion, setOpenAccordion] = useState<string>('payment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);
  
  const shipping = subtotal > 150000 ? 0 : totalItems > 0 ? 1200 : 0;
  const estimatedTotal = subtotal + shipping;

  useEffect(() => {
    const savedAddresses = getItem<any[]>(StorageKeys.ADDRESSES) || [];
    const selectedId = getItem<string>('checkout_delivery_address_id');
    if (selectedId && savedAddresses.length > 0) {
       const addr = savedAddresses.find(a => a.id === selectedId);
       if (addr) setDeliveryAddress(addr);
    }
  }, []);

  const handlePlaceOrder = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
      
      if (!RAZORPAY_KEY_ID && selectedMethod === 'razorpay') {
         toast.error('Razorpay key is not configured.');
         setIsProcessing(false);
         return;
      }

      const tenantId = await getCurrentTenantId();
      const token = getItem<string>(StorageKeys.ACCESS_TOKEN) || 'test-token';

      // API Call to Backend to Create Razorpay Order
      const createOrderResponse = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId
        },
        body: JSON.stringify({
          amount: estimatedTotal,
          currency: 'INR'
        })
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        toast.error(`Failed to create order: ${errorData.message || 'Unknown error'}`);
        setIsProcessing(false);
        return;
      }

      const { data: orderData } = await createOrderResponse.json();

      if (selectedMethod === 'cod') {
         clearCart();
         navigate(`/order-success?order_id=${orderData.id || orderData.razorpayOrderId}`, { replace: true });
         return;
      }

      // Load Razorpay Script
      const isLoaded = await import('@/lib/razorpay').then(m => m.loadRazorpayScript());
      if (!isLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your connection.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: estimatedTotal * 100,
        currency: "INR",
        name: "Shanti Jewellers",
        description: `Order ${orderData.id || orderData.razorpayOrderId}`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('http://localhost:5000/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-tenant-id': tenantId
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                amount: estimatedTotal,
                cartItems: cartItems,
                deliveryAddress: deliveryAddress || {}
              })
            });
            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              console.error('Payment verification failed backend response:', errorData);
              toast.error(`Verification Failed: ${errorData.message || 'Unknown error'}`);
              navigate('/payment-failed', { replace: true });
              return;
            }
            
            clearCart();
            
            // Extract orderId from the verification response instead of createOrder response
            // The verification response returns { success: true, message: "...", orderId: "ord_..." }
            const verifyData = await verifyResponse.json();
            const finalOrderId = verifyData?.orderId || verifyData?.data?.orderId || orderData.id || orderData.razorpayOrderId;
            
            navigate(`/order-success?order_id=${finalOrderId}`, { replace: true });
          } catch (e: any) {
            console.error('Payment verification exception:', e);
            toast.error(`Verification Exception: ${e.message || 'Unknown error'}`);
            navigate('/payment-failed', { replace: true });
          }
        },
        prefill: {
          method: 'card',
        },
        theme: {
          color: "#DFA47F"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description || 'Payment failed. Please try again.');
      });

      rzp.open();
    } catch {
      toast.error('An error occurred during checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentOptions = [
    { id: 'cod', name: 'Cash on Delivery', icon: Banknote, subtitle: 'Pay when your order arrives' },
    { id: 'razorpay', name: 'Pay on Razorpay', icon: CreditCard, subtitle: 'Pay securely via Razorpay' },
  ];

  return (
    <div className="min-h-screen bg-charcoal text-white flex flex-col">
      <CheckoutHeader currentStep={3} />

      <main className="flex-1 py-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          
          {/* Left Column - Payment Selection */}
          <div className="space-y-6">
            
            {/* Offers available for you */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-white">Offers available for you</h2>
                <button className="text-sm text-gold font-medium hover:underline">View all</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="min-w-[200px] h-20 rounded-md bg-gold/10 border border-gold/20 p-3">
                     <p className="text-[10px] text-gray-400">Usage Limit 1 per user</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Redemption options */}
            <div className="bg-charcoal-light border border-white/10 rounded-md overflow-hidden mt-6">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5"
                onClick={() => setOpenAccordion(openAccordion === 'redemption' ? '' : 'redemption')}
              >
                <h3 className="font-medium text-lg text-white">Redemption options for you</h3>
                {openAccordion === 'redemption' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
              {openAccordion === 'redemption' && (
                <div className="p-4 border-t border-white/10 text-gray-400 text-sm">
                  No redemption options available currently.
                </div>
              )}
            </div>

            {/* Payment Options */}
            <div className="bg-charcoal-light border border-white/10 rounded-md overflow-hidden">
              <div 
                className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${openAccordion === 'payment' ? 'bg-white/5' : 'hover:bg-white/5'} text-white`}
                onClick={() => setOpenAccordion(openAccordion === 'payment' ? '' : 'payment')}
              >
                <h3 className="font-medium text-lg">Payment Options</h3>
                {openAccordion === 'payment' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
              
              {openAccordion === 'payment' && (
                <div className="p-4 border-t border-white/10 space-y-3 bg-charcoal-light">
                  {paymentOptions.map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`border rounded-lg p-4 cursor-pointer flex items-center gap-4 transition-all ${selectedMethod === method.id ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/30 bg-charcoal'}`}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedMethod === method.id ? 'border-gold' : 'border-gray-500'}`}>
                          {selectedMethod === method.id && <div className="w-3 h-3 rounded-full bg-gold" />}
                        </div>
                      </div>
                      <div className="text-gold opacity-80">
                         <method.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{method.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{method.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Delivery Address Box */}
            {deliveryAddress && (
              <div className="mt-8">
                <h3 className="text-gold font-medium mb-3">Delivery Address</h3>
                <div className="bg-charcoal-light border border-white/10 rounded-md p-4 flex gap-4">
                   <div className="w-10 h-10 flex-shrink-0 bg-gold/20 rounded flex items-center justify-center text-gold">
                      <Home className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="font-medium text-white">{deliveryAddress.fullName}</h4>
                      <p className="text-xs text-gray-400 mt-1">{deliveryAddress.street}, {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.zip}</p>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            
            <h3 className="text-gold font-medium text-lg mb-2">Cart Summary</h3>
            
            {/* Cart Items */}
            <div className="bg-charcoal-light border border-white/10 rounded-lg p-4">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.key} className="flex gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded border border-white/20" />
                    <div>
                      <h4 className="text-white text-sm font-medium">{item.name}</h4>
                      <div className="font-semibold text-gold mt-1">{formatPrice(item.unitPrice)}</div>
                      <div className="text-xs text-gray-400 mt-2">
                         Quantity: {item.quantity} &nbsp;&nbsp; Size: {item.selection.size !== 'N/A' ? item.selection.size : 'Adjustable'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-gold font-medium text-lg mt-6 mb-2">Price Details</h3>
            
            {/* Price Details */}
            <div className="bg-charcoal-light border border-white/10 rounded-lg p-6">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cart MRP ({totalItems} Item{totalItems > 1 ? 's' : ''})</span>
                  <span className="font-medium text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className="font-medium text-white">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                
                <div className="border-t border-white/10 pt-4 mt-4 flex justify-between font-medium">
                  <span className="text-gold">Total</span>
                  <span className="text-gold text-lg">{formatPrice(estimatedTotal)}</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => void handlePlaceOrder()}
              disabled={isProcessing}
              className="w-full bg-gold hover:bg-gold-light text-charcoal text-base font-medium py-6 rounded-md"
            >
              {isProcessing ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
