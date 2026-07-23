import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone, ArrowLeft, ShieldCheck, Tag } from 'lucide-react';
import { loadRazorpayScript } from '@/lib/razorpay';
import { toast } from 'sonner';
import { getItem, StorageKeys } from '@/auth/storage';

export default function PaymentGatewayPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, razorpayOrderId, amount, method } = location.state || {};

  useEffect(() => {
    if (!orderId || !razorpayOrderId) {
      navigate('/checkout/payment', { replace: true });
    }
  }, [orderId, razorpayOrderId, navigate]);

  if (!orderId || !razorpayOrderId) return null;

  const handlePayNow = async () => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error('Failed to load Razorpay SDK. Please check your connection.');
      return;
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) {
      toast.error('Payment configuration error.');
      return;
    }

    const options = {
      key,
      amount: amount * 100,
      currency: "INR",
      name: "Shanti Jewellers",
      description: `Order ${orderId}`,
      order_id: razorpayOrderId,
      handler: async function (response: any) {
        try {
          // Verify with backend
          const tenantId = await import('@/lib/tenant').then(m => m.getCurrentTenantId());
          const token = getItem<string>(StorageKeys.ACCESS_TOKEN) || 'test-token';
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
              amount: amount,
              cartItems: [],
              deliveryAddress: {}
            })
          });
          
          if (!verifyResponse.ok) {
            toast.error('Payment verification failed.');
            return;
          }
          
          navigate(`/order-success?order_id=${orderId}`, { replace: true });
        } catch (e) {
          toast.error('Error verifying payment.');
        }
      },
      prefill: {
        method: method === 'debit' || method === 'credit' ? 'card' : method,
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
  };

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
        
        {/* Left Panel - Blue Theme */}
        <div className="w-full md:w-[400px] bg-blue-600 text-white p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <div className="flex items-center gap-2 text-sm text-blue-200">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               14:59 mins
             </div>
          </div>
          
          <div className="flex items-center gap-4 mt-8 mb-10">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-charcoal font-bold text-2xl tracking-tighter leading-none p-2">
               SJ
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">Shanti Jewellers<br/>Private Limited</h2>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-blue-200 text-sm mb-1">Order ID</p>
              <p className="font-semibold text-lg">{orderId.split('-')[0].toUpperCase()}</p>
            </div>
            <div className="w-full h-px bg-blue-500/50"></div>
            <div>
              <p className="text-sm">{orderId}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <button className="w-full flex items-center justify-between bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/30 rounded-lg p-4 transition-colors text-left">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-blue-200" />
                <span className="font-medium">Apply Coupons / Offers</span>
              </div>
              <ChevronRightIcon />
            </button>

            <div className="bg-white rounded-lg p-4 text-charcoal">
              <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                <span>Order Summary</span>
                <ChevronRightIcon className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold">
                {formattedAmount}
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between text-xs text-blue-200">
             <div>
                {/* Abstract graphic */}
                <div className="w-32 h-32 opacity-20 bg-[url('https://cdn-icons-png.flaticon.com/512/3514/3514491.png')] bg-contain bg-no-repeat bg-bottom"></div>
             </div>
             <div className="text-right pb-2">
                Secured by<br/><strong className="text-white text-sm">Razorpay</strong>
             </div>
          </div>
        </div>

        {/* Right Panel - White Theme */}
        <div className="flex-1 bg-white flex flex-col h-full">
          {/* Header */}
          <div className="h-16 border-b flex items-center px-6 justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium text-lg">
                {method === 'debit' || method === 'credit' ? 'Cards' : method === 'netbanking' ? 'Netbanking' : 'UPI'}
              </span>
            </button>
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {(method === 'debit' || method === 'credit') && <CardForm />}
            {method === 'netbanking' && <NetbankingForm />}
            {method === 'upi' && <UpiForm />}
          </div>

          {/* Footer */}
          <div className="mt-auto border-t">
            <div className="bg-gray-50 py-3 text-center">
              <a href="#" className="text-sm text-blue-600 hover:underline">Privacy Policy</a>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-gray-900">{formattedAmount}</div>
                <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                  View Summary <ChevronUpIcon />
                </button>
              </div>
              <Button 
                onClick={handlePayNow}
                className="bg-[#E7B5A3] hover:bg-[#d6a592] text-gray-900 min-w-[160px] h-12 text-lg font-medium shadow-sm"
              >
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardForm() {
  return (
    <div className="max-w-md h-full flex flex-col justify-center">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
           <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg mb-2">Secure Card Payment</h3>
        <p className="text-gray-500 text-sm">
          To ensure the highest level of PCI-DSS security, your card details will be collected directly inside Razorpay's encrypted popup. 
        </p>
        <p className="text-gray-500 text-sm mt-4">
          Click the <strong>Pay Now</strong> button below to open the secure payment window.
        </p>
      </div>
    </div>
  );
}

function NetbankingForm() {
  const banks = [
    { name: 'ICICI', logo: 'https://companieslogo.com/img/orig/IBN-5b1b44b8.png?t=1648383607' },
    { name: 'HDFC', logo: 'https://companieslogo.com/img/orig/HDB-8ef87085.png?t=1633497370' },
    { name: 'Kotak', logo: 'https://companieslogo.com/img/orig/KOTAKBANK.NS-9642646d.png?t=1593960100' },
    { name: 'Axis', logo: 'https://companieslogo.com/img/orig/AXISBANK.NS-9c4c703e.png?t=1593960100' },
    { name: 'PNB', logo: 'https://companieslogo.com/img/orig/PNB.NS-bb7db868.png?t=1593960100' },
    { name: 'Canara', logo: 'https://companieslogo.com/img/orig/CANBK.NS-cc1d1ff3.png?t=1593960100' },
  ];

  return (
    <div className="max-w-md">
      <h3 className="text-gray-600 font-medium mb-6">Select a Bank</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {banks.map((bank) => (
          <div key={bank.name} className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all">
            <div className="w-10 h-10 flex items-center justify-center mb-3">
               <img src={bank.logo} alt={bank.name} className="max-w-full max-h-full object-contain" />
            </div>
            <span className="text-xs font-medium text-gray-600">{bank.name}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <select className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3.5 text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">Select another bank</option>
          <option value="sbi">State Bank of India</option>
          <option value="boi">Bank of India</option>
          <option value="yes">Yes Bank</option>
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  );
}

function UpiForm() {
  return (
    <div className="max-w-md h-full flex flex-col justify-center">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
           <Smartphone className="w-8 h-8" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg mb-2">Secure UPI Payment</h3>
        <p className="text-gray-500 text-sm">
          You can securely pay via any UPI app (GPay, PhonePe, Paytm). The QR code will be generated by our payment partner Razorpay.
        </p>
        <p className="text-gray-500 text-sm mt-4">
          Click the <strong>Pay Now</strong> button below to open the secure payment window.
        </p>
      </div>
    </div>
  );
}

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
);
