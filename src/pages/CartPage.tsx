import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, X, Tag, Minus, Plus, CheckCircle, ShieldCheck, Truck, Shield } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Footer } from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { collections } from '@/data/collections';
import { buildTenantWhatsappHref } from '@/lib/whatsapp';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

type InquiryItem = {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  selection: {
    metal: string;
    carat: number;
    diamondType: string;
    size: string;
  };
};

function buildCartInquiryMessage(
  items: InquiryItem[],
  subtotal: number,
  shipping: number,
  total: number,
  getProductUrl: (productId: number) => string,
) {
  const lines = [
    'Hi, I would like to inquire about these products:',
    '',
    ...items.flatMap((item, index) => {
      const productUrl = getProductUrl(item.productId);
      const lineTotal = item.unitPrice * item.quantity;
      return [
        `${index + 1}. ${item.name}`,
        `   Quantity: ${item.quantity}`,
        `   Unit Price: ${formatPrice(item.unitPrice)}`,
        `   Metal: ${item.selection.metal || 'N/A'}`,
        `   Carat: ${item.selection.carat || 0} ct`,
        `   Diamond Type: ${item.selection.diamondType || 'N/A'}`,
        `   Size: ${item.selection.size || 'N/A'}`,
        '   Product Page:',
        `   ${productUrl}`,
        `   Line Total: ${formatPrice(lineTotal)}`,
        '',
      ];
    }),
    `Subtotal: ${formatPrice(subtotal)}`,
    `Shipping: ${formatPrice(shipping)}`,
    `Estimated Total: ${formatPrice(total)}`,
  ];

  return lines.join('\n');
}

function CartPage() {
  const { cartItems, totalItems, subtotal, updateQuantity, removeFromCart } = useCart();
  const [isOpeningInquiry, setIsOpeningInquiry] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [tempPincode, setTempPincode] = useState('');
  const [isPincodeDialogOpen, setIsPincodeDialogOpen] = useState(false);

  const handlePincodeSubmit = () => {
    if (!tempPincode.trim() || tempPincode.length < 5) {
      toast.error('Please enter a valid pincode.');
      return;
    }
    setDeliveryPincode(tempPincode);
    setIsPincodeDialogOpen(false);
    toast.success('Delivery pincode updated.');
  };

  const shipping = subtotal > 150000 ? 0 : totalItems > 0 ? 1200 : 0;
  const estimatedTotal = subtotal + shipping;

  const getProductHref = (productId: number) => {
    const collection = collections.find((item) =>
      item.products.some((product) => product.id === productId),
    );

    return collection
      ? `/collections/${collection.slug}/product/${productId}`
      : `/product/${productId}`;
  };

  const getProductUrl = (productId: number) =>
    new URL(getProductHref(productId), window.location.origin).toString();

  const handleOpenInquiry = async () => {
    if (isOpeningInquiry) {
      return;
    }

    setIsOpeningInquiry(true);

    try {
      const message = buildCartInquiryMessage(
        cartItems,
        subtotal,
        shipping,
        estimatedTotal,
        getProductUrl,
      );
      const inquiryHref = await buildTenantWhatsappHref(message);

      if (!inquiryHref) {
        toast.error('No WhatsApp number is configured for this tenant.');
        return;
      }

      const openedWindow = window.open(inquiryHref, '_blank', 'noopener,noreferrer');
      if (!openedWindow) {
        window.location.href = inquiryHref;
      }
    } catch {
      toast.error('Unable to open WhatsApp inquiry right now.');
    } finally {
      setIsOpeningInquiry(false);
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a valid coupon code.');
      return;
    }
    toast.success(`Coupon "${couponCode}" applied successfully (Mock).`);
    setCouponCode('');
  };

  return (
    <main className="min-h-screen bg-charcoal text-white page-fade-in pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl text-center flex-1">
            Shopping Cart ({totalItems})
          </h1>
          <Button
            type="button"
            onClick={() => void handleOpenInquiry()}
            disabled={isOpeningInquiry}
            className="bg-[#587e4c] hover:bg-[#46663c] text-white rounded-md flex items-center gap-2 px-6 h-11"
          >
            <MessageCircle className="w-4 h-4" />
            Get Whatsapp Assistance
          </Button>
        </div>

        {cartItems.length === 0 ? (
          <div className="border border-white/10 bg-charcoal-light p-8 rounded-lg text-center mt-12">
            <p className="text-gray-300 mb-6 text-lg">Your cart is empty.</p>
            <Link to="/" className="inline-block px-8 py-3 bg-gold text-charcoal font-medium hover:bg-gold-light transition-colors rounded-md">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Left Column - Cart Items */}
            <div className="space-y-6">
              <div className="flex justify-end mb-4 border-b border-white/10 pb-4">
                 <div className="text-sm flex items-center gap-3">
                   <span className="text-[#b85b5b] font-medium text-base">Check Delivery Date</span> 
                   {deliveryPincode ? (
                     <div className="flex items-center gap-2">
                       <span className="text-white font-medium">{deliveryPincode}</span>
                       <button onClick={() => { setTempPincode(deliveryPincode); setIsPincodeDialogOpen(true); }} className="text-[#b85b5b] underline font-medium hover:text-[#d0a76d] transition-colors">Change</button>
                     </div>
                   ) : (
                     <button onClick={() => { setTempPincode(''); setIsPincodeDialogOpen(true); }} className="text-[#b85b5b] underline font-medium hover:text-[#d0a76d] transition-colors">Click here</button>
                   )}
                 </div>
              </div>
              
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.key} className="relative flex flex-col sm:flex-row gap-6 p-4 border-b border-white/10 bg-charcoal-light/50 rounded-lg sm:bg-transparent sm:border-0 sm:rounded-none sm:p-0">
                    {/* Remove button */}
                    <button 
                      onClick={() => removeFromCart(item.key)}
                      className="absolute top-4 right-4 sm:top-0 sm:right-0 w-6 h-6 bg-[#621422] rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-[#4c0f1a] transition-colors z-10"
                      aria-label="Remove item"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Image */}
                    <Link to={getProductHref(item.productId)} className="block w-full sm:w-[140px] h-[140px] flex-shrink-0 border border-white/10 rounded-md overflow-hidden bg-white/5">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </Link>
                    
                    {/* Details */}
                    <div className="flex-1 pr-8">
                      <Link to={getProductHref(item.productId)} className="block font-serif text-lg text-white mb-1 hover:text-gold transition-colors">
                        {item.name}
                      </Link>
                      
                      <div className="text-xl text-[#d0a76d] font-medium mb-4">
                        {formatPrice(item.unitPrice)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 mr-1">Quantity:</span>
                          <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gold border border-white/20 rounded bg-charcoal-light"><Minus className="w-3 h-3" /></button>
                          <span className="w-4 text-center font-medium text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gold border border-white/20 rounded bg-charcoal-light"><Plus className="w-3 h-3" /></button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Size: </span>
                          <span className="text-white">{item.selection.size !== 'N/A' ? item.selection.size : 'Adjustable'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Column - Summary */}
            <div className="space-y-6">
              {/* Coupon Input */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code here" 
                  className="flex-1 bg-charcoal-light border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
                />
                <Button onClick={handleApplyCoupon} className="bg-gold hover:bg-gold-light text-charcoal font-medium rounded-md px-6 transition-colors">
                  Apply Code
                </Button>
              </div>
              
              {/* Discount Coupons Banner */}
              <div className="bg-gradient-to-r from-gold/20 to-gold/5 border border-gold/20 rounded-md p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-gold" />
                  <span className="font-medium text-gold">Discount Coupons</span>
                </div>
                <button className="text-sm text-white underline hover:text-gold transition-colors">
                  View all
                </button>
              </div>
              
              {/* Price Details */}
              <div className="bg-charcoal-light border border-white/10 rounded-md p-6">
                <h3 className="font-medium text-white mb-6 border-b border-white/10 pb-4">Price Details</h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cart MRP ({totalItems} Item{totalItems > 1 ? 's' : ''})</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-white">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4 mt-4 flex justify-between font-medium">
                    <span className="text-[#b85b5b]">Total</span>
                    <span className="text-[#b85b5b] text-lg">{formatPrice(estimatedTotal)}</span>
                  </div>
                </div>
              </div>
              
              <Link 
                to="/checkout/shipping"
                className="w-full bg-gold hover:bg-gold-light text-charcoal text-base font-medium py-4 rounded-md flex items-center justify-center text-center transition-colors"
              >
                Place Order
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Trust Badges Section */}
      {cartItems.length > 0 && (
        <section className="mt-16 pt-12 pb-8 border-t border-white/10 bg-charcoal-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 mb-4 flex items-center justify-center text-[#b85b5b] bg-white/5 rounded-full">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="font-medium text-[#b85b5b] mb-2">BIS Hallmark Jewellery</h4>
                <p className="text-xs text-gray-400 max-w-[200px]">Authenticity Guaranteed, Purity Assured</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 mb-4 flex items-center justify-center text-[#d0a76d] bg-white/5 rounded-full">
                  <Truck className="w-7 h-7" />
                </div>
                <h4 className="font-medium text-[#d0a76d] mb-2">Fast Shipping</h4>
                <p className="text-xs text-gray-400 max-w-[200px]">Swift & Secure Delivery to Your Doorstep</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 mb-4 flex items-center justify-center text-[#b85b5b] bg-white/5 rounded-full">
                  <Shield className="w-7 h-7" />
                </div>
                <h4 className="font-medium text-[#b85b5b] mb-2">Certified Diamonds</h4>
                <p className="text-xs text-gray-400 max-w-[200px]">Authenticity You Can Trust with Uncompromised Quality</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 mb-4 flex items-center justify-center text-[#d0a76d] bg-white/5 rounded-full">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="font-medium text-[#d0a76d] mb-2">Free Insured Shipping</h4>
                <p className="text-xs text-gray-400 max-w-[200px]">Your Precious Jewellery, Protected Every Step of the Way</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <Dialog open={isPincodeDialogOpen} onOpenChange={setIsPincodeDialogOpen}>
        <DialogContent className="bg-charcoal-light border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-white mb-2">Check Delivery Date</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <input 
              type="text" 
              value={tempPincode}
              onChange={(e) => setTempPincode(e.target.value)}
              placeholder="Please enter pincode" 
              className="bg-charcoal border border-white/20 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50"
            />
            <Button 
              onClick={handlePincodeSubmit} 
              className="bg-[#b85b5b] hover:bg-[#a04b4b] text-white w-[120px] rounded-md font-medium"
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  );
}

export default CartPage;
