import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckoutHeader } from '@/components/CheckoutHeader';
import { useCart } from '@/context/CartContext';
import { getItem, setItem, StorageKeys } from '@/auth/storage';

interface Address {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  phone?: string;
  altPhone?: string;
  gst?: string;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CheckoutAddressPage() {
  const navigate = useNavigate();
  const { cartItems, totalItems, subtotal } = useCart();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string | null>(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    label: 'Home',
    fullName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    isDefault: false,
    phone: '',
    altPhone: '',
    gst: ''
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);

  // Load addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = getItem<string>(StorageKeys.ACCESS_TOKEN) || 'test-token';
        const { getCurrentTenantId } = await import('@/lib/tenant');
        const tenantId = await getCurrentTenantId();
        
        const res = await fetch('http://localhost:5000/api/addresses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant-id': tenantId
          }
        });
        
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
             const mapped = json.data.map((a: any) => ({
                id: a.id,
                label: 'Home',
                fullName: a.fullName,
                street: a.addressLine1,
                city: a.city,
                state: a.state,
                zip: a.postalCode,
                country: a.country,
                isDefault: a.isDefault,
                phone: a.phone
             }));
             setAddresses(mapped);
             const defaultAddr = mapped.find((a: any) => a.isDefault);
             setSelectedAddressId(defaultAddr ? defaultAddr.id : mapped[0].id);
             setSelectedBillingAddressId(defaultAddr ? defaultAddr.id : mapped[0].id);
             return;
          }
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      }
      
      // Fallback to local storage
      const saved = getItem<Address[]>(StorageKeys.ADDRESSES) || [];
      setAddresses(saved);
      if (saved.length > 0) {
        const defaultAddr = saved.find(a => a.isDefault);
        setSelectedAddressId(defaultAddr ? defaultAddr.id : saved[0].id);
        setSelectedBillingAddressId(defaultAddr ? defaultAddr.id : saved[0].id);
      }
    };
    
    fetchAddresses();
  }, []);

  const shipping = subtotal > 150000 ? 0 : totalItems > 0 ? 1200 : 0;
  const estimatedTotal = subtotal + shipping;

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedAddresses = [...addresses];
    
    if (formData.isDefault || updatedAddresses.length === 0) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
      formData.isDefault = true;
    }

    const newAddress = { ...formData, id: crypto.randomUUID() };
    updatedAddresses.push(newAddress);
    
    setAddresses(updatedAddresses);
    setItem(StorageKeys.ADDRESSES, updatedAddresses);
    
    setSelectedAddressId(newAddress.id);
    setIsAdding(false);
    toast.success('Address added successfully');
    
    setFormData({
      label: 'Home',
      fullName: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'India',
      isDefault: false,
      phone: '',
      altPhone: '',
      gst: ''
    });
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address');
      return;
    }
    
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddress) return;

    setIsProcessing(true);
    try {
      const token = getItem<string>(StorageKeys.ACCESS_TOKEN) || 'test-token';
      const { getCurrentTenantId } = await import('@/lib/tenant');
      const tenantId = await getCurrentTenantId();
      
      const payload: any = {};
      
      if (selectedAddress.id.length < 36 && !selectedAddress.id.includes('-')) {
        // It's a CUID from Prisma
        payload.addressId = selectedAddress.id;
      } else {
        // It's a newly created local address, send as object so backend creates it
        payload.address = {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone || '',
          addressLine1: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          country: selectedAddress.country,
          postalCode: selectedAddress.zip,
          isDefault: selectedAddress.isDefault
        };
      }
      
      // Sync frontend cart to backend to prevent "Cart is empty" errors
      try {
        await fetch('http://localhost:5000/api/cart/clear', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-id': tenantId }
        });
        
        for (const item of cartItems) {
          await fetch('http://localhost:5000/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'x-tenant-id': tenantId },
            body: JSON.stringify({ productId: String(item.productId), quantity: item.quantity, selection: item.selection })
          });
        }
      } catch (err) {
        console.error('Failed to sync cart:', err);
      }

      const response = await fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Checkout failed: ${errorData.message || 'Unknown error'}`);
        return;
      }
      
      const sessionData = await response.json();
      
      // Save selected address to session or state for the next step if needed
      setItem('checkout_session_id', sessionData.data.id);
      setItem('checkout_delivery_address_id', sessionData.data.addressId || selectedAddressId);
      
      navigate('/checkout/payment');
    } catch (error) {
      toast.error('An error occurred while connecting to the server');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-white flex flex-col">
      <CheckoutHeader currentStep={2} />

      <main className="flex-1 py-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          
          {/* Left Column - Address Selection */}
          <div className="space-y-8">
            
            {/* Delivery Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-center text-white">Delivery Details</h2>
              
              <div className="bg-gold/10 border border-gold/30 rounded-lg p-6 cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-gold/20 rounded-md text-gold">
                    <Home className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-lg text-white">Home Delivery</span>
                </div>
                <div className="w-6 h-6 rounded-full border-[6px] border-gold bg-charcoal"></div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-center text-white">Shipping address</h2>
              
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div 
                    key={address.id} 
                    onClick={() => setSelectedAddressId(address.id)}
                    className={`bg-charcoal-light border rounded-lg p-6 cursor-pointer flex justify-between items-start transition-all ${selectedAddressId === address.id ? 'border-gold shadow-sm' : 'border-white/10 hover:border-white/30'}`}
                  >
                    <div className="flex gap-4">
                      <div className="mt-1 w-10 h-10 flex items-center justify-center bg-charcoal rounded text-gold">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gold text-lg">{address.fullName} {address.label ? `(${address.label})` : ''}</h3>
                        <p className="text-gray-300 text-sm mt-1 leading-relaxed max-w-md">
                          {address.street}, {address.city}, {address.state} - {address.zip}
                        </p>
                        {address.phone && <p className="text-gray-300 text-sm mt-1">Ph: {address.phone}</p>}
                      </div>
                    </div>
                    
                    {selectedAddressId === address.id && (
                      <div className="w-6 h-6 rounded-full bg-gold text-charcoal flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setIsAdding(true)}
                className="text-gold font-medium flex items-center gap-2 mt-4 hover:underline"
              >
                <Plus className="w-4 h-4" /> Add new delivery address
              </button>
            </div>

            {/* Billing Address */}
            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-center text-white">Billing address</h2>
              
              <div className="bg-charcoal-light border border-white/10 rounded-lg overflow-hidden">
                <div 
                  onClick={() => setSameAsShipping(true)}
                  className={`p-5 cursor-pointer flex justify-between items-center border-b border-white/5 ${sameAsShipping ? 'bg-white/5' : ''}`}
                >
                  <span className="font-medium text-white">Same as shipping address</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${sameAsShipping ? 'bg-[#731919] text-white' : 'border border-white/30'}`}>
                    {sameAsShipping && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
                
                <div 
                  onClick={() => setSameAsShipping(false)}
                  className={`p-5 cursor-pointer flex justify-between items-center ${!sameAsShipping ? 'bg-white/5' : ''}`}
                >
                  <span className="font-medium text-white">Use a different billing address</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${!sameAsShipping ? 'bg-[#731919] text-white' : 'border border-white/30'}`}>
                    {!sameAsShipping && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {!sameAsShipping && (
                  <div className="p-5 bg-charcoal-light border-t border-white/5 space-y-4">
                    {addresses.map((address) => (
                      <div 
                        key={`billing-${address.id}`}
                        onClick={() => setSelectedBillingAddressId(address.id)}
                        className={`border rounded-lg p-4 cursor-pointer flex justify-between items-start transition-all ${selectedBillingAddressId === address.id ? 'border-white/50 bg-white/5' : 'border-white/10 hover:border-white/30'}`}
                      >
                        <div>
                          <h3 className="font-medium text-white text-base">{address.fullName}</h3>
                          <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                            {address.street}, {address.city}, {address.state} - {address.zip}
                          </p>
                        </div>
                        <div className="mt-1 flex-shrink-0">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedBillingAddressId === address.id ? 'border-[#731919]' : 'border-gray-500'}`}>
                            {selectedBillingAddressId === address.id && <div className="w-3 h-3 rounded-full bg-[#731919]" />}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => setIsAdding(true)}
                      className="text-[#731919] font-medium flex items-center gap-1 mt-4 hover:underline text-sm"
                    >
                      + Edit billing address
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Whatsapp Notifications */}
            <div 
              className="bg-[#587e4c]/80 rounded-lg p-5 flex items-start gap-4 cursor-pointer text-white border border-white/10"
              onClick={() => setWhatsappNotifications(!whatsappNotifications)}
            >
              <div className="mt-0.5">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg">Receive notifications on whatsapp {selectedAddressId ? addresses.find(a => a.id === selectedAddressId)?.phone || '' : ''}</h3>
                <p className="text-white/80 text-sm mt-1">Delivery related communications, quality and certification queries and over all interactive customer support</p>
              </div>
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  checked={whatsappNotifications}
                  readOnly
                  className="w-5 h-5 rounded border-white/50 text-[#587e4c] bg-transparent focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            
            {/* Cart Summary */}
            <div className="bg-charcoal-light border border-white/10 rounded-lg p-6">
              <h3 className="font-medium text-gold mb-4">Cart Summary</h3>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.key} className="flex gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md border border-white/20" />
                    <div>
                      <h4 className="text-white text-sm">{item.name}</h4>
                      <div className="font-medium text-gold mt-1">{formatPrice(item.unitPrice)}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Quantity: {item.quantity} &nbsp;|&nbsp; Size: {item.selection.size !== 'N/A' ? item.selection.size : 'Adjustable'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-charcoal-light border border-white/10 rounded-lg p-6">
              <h3 className="font-medium text-gold mb-6 pb-2 border-b border-white/10">Price Details</h3>
              
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
              onClick={handleContinue}
              disabled={isProcessing}
              className="w-full bg-gold hover:bg-gold-light text-charcoal text-base font-medium py-6 rounded-md disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </div>
        </div>
      </main>

      {/* Add Address Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="bg-charcoal-light border border-white/10 text-white sm:max-w-[500px] p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b border-white/10 bg-charcoal/50">
            <DialogTitle className="text-xl font-medium text-white">Add Shipping Address</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddAddress} className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input required type="text" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 bg-charcoal border border-white/20 rounded-md text-white focus:ring-2 focus:ring-gold/30 outline-none text-sm placeholder:text-gray-500" />
              </div>
              <div className="col-span-2">
                <input required type="text" placeholder="Address Line 1 (House No, Building, Street)" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-3 bg-charcoal border border-white/20 rounded-md text-white focus:ring-2 focus:ring-gold/30 outline-none text-sm placeholder:text-gray-500" />
              </div>
              <div className="col-span-1">
                <input required type="text" placeholder="Pincode" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="w-full px-4 py-3 bg-charcoal border border-white/20 rounded-md text-white focus:ring-2 focus:ring-gold/30 outline-none text-sm placeholder:text-gray-500" />
              </div>
              <div className="col-span-1">
                <input required type="text" placeholder="Country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3 bg-charcoal border border-white/20 rounded-md text-white focus:ring-2 focus:ring-gold/30 outline-none text-sm placeholder:text-gray-500" />
              </div>
              <div className="col-span-1">
                <input required type="text" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 bg-charcoal border border-white/20 rounded-md text-white focus:ring-2 focus:ring-gold/30 outline-none text-sm placeholder:text-gray-500" />
              </div>
              <div className="col-span-1">
                <input required type="text" placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-3 bg-charcoal border border-white/20 rounded-md text-white focus:ring-2 focus:ring-gold/30 outline-none text-sm placeholder:text-gray-500" />
              </div>
              <div className="col-span-2">
                <input required type="tel" placeholder="Mobile Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-charcoal border border-white/20 rounded-md text-white focus:ring-2 focus:ring-gold/30 outline-none text-sm placeholder:text-gray-500" />
              </div>
              <div className="col-span-2">
                <input type="tel" placeholder="Alternate Mobile number (Optional)" value={formData.altPhone} onChange={e => setFormData({...formData, altPhone: e.target.value})} className="w-full px-4 py-3 bg-charcoal border border-white/20 rounded-md text-white focus:ring-2 focus:ring-gold/30 outline-none text-sm placeholder:text-gray-500" />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input 
                type="checkbox" 
                id="gst" 
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-charcoal text-gold focus:ring-gold"
              />
              <label htmlFor="gst" className="text-sm text-gray-400">GST Number for business purchases (Optional)</label>
            </div>

            <div className="flex items-start gap-2">
              <input 
                required
                type="checkbox" 
                id="terms" 
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-charcoal text-gold focus:ring-gold"
              />
              <label htmlFor="terms" className="text-sm text-gray-400">
                By clicking Accept and Continue, you are agreeing to the <a href="#" className="underline text-gold">Terms of Use</a> and <a href="#" className="underline text-gold">Privacy Policy</a>.
              </label>
            </div>

            <div className="pt-4 pb-2">
              <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-charcoal py-6 text-base rounded-md font-medium">
                Save Address Details
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
