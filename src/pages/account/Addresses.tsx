import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { getItem, setItem, StorageKeys } from '@/auth/storage';
import { MapPin, Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

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
}

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    label: 'Home',
    fullName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    isDefault: false
  });

  useEffect(() => {
    const saved = getItem<Address[]>(StorageKeys.ADDRESSES) || [];
    setAddresses(saved);
  }, []);

  const resetForm = () => {
    setFormData({
      label: 'Home',
      fullName: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      isDefault: false
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (addr: Address) => {
    setFormData({ ...addr });
    setEditingId(addr.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    setItem(StorageKeys.ADDRESSES, updated);
    toast.success('Address removed');
  };

  const setAsDefault = (id: string) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    setAddresses(updated);
    setItem(StorageKeys.ADDRESSES, updated);
    toast.success('Default address updated');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedAddresses = [...addresses];

    // If making this one default, unset others
    if (formData.isDefault || updatedAddresses.length === 0) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
      formData.isDefault = true;
    }

    if (editingId) {
      updatedAddresses = updatedAddresses.map(a => 
        a.id === editingId ? { ...formData, id: editingId } : a
      );
      toast.success('Address updated');
    } else {
      const newAddress = { ...formData, id: crypto.randomUUID() };
      updatedAddresses.push(newAddress);
      toast.success('Address added');
    }

    setAddresses(updatedAddresses);
    setItem(StorageKeys.ADDRESSES, updatedAddresses);
    resetForm();
  };

  return (
    <DashboardLayout title="Saved Addresses">
      
      {!isAdding && (
        <div className="mb-6 flex justify-end">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal rounded-md font-medium hover:bg-gold/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>
      )}

      {isAdding ? (
        <div className="bg-charcoal border border-white/10 rounded-lg p-6 mb-8 card-luxury">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h3 className="text-xl font-serif text-white">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Label (e.g. Home, Office)</label>
                <input required type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:border-gold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Full Name</label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:border-gold outline-none" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-gray-300">Street Address</label>
                <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:border-gold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">City</label>
                <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:border-gold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">State / Province</label>
                <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:border-gold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">ZIP / Postal Code</label>
                <input required type="text" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:border-gold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Country</label>
                <input required type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:border-gold outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isDefault" 
                checked={formData.isDefault} 
                onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                className="w-4 h-4 accent-gold"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-300">Set as default address</label>
            </div>

            <div className="pt-4 flex gap-4">
              <button type="submit" className="px-6 py-2 bg-gold text-charcoal font-medium rounded-md hover:bg-gold/90 transition-colors">
                Save Address
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 border border-white/10 text-white font-medium rounded-md hover:bg-white/5 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {!isAdding && addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-white font-serif mb-2">No addresses saved</h3>
          <p className="text-gray-400">Add an address to make your checkout experience faster.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="bg-charcoal-light border border-white/10 p-5 rounded-lg relative card-luxury">
              {address.isDefault && (
                <span className="absolute top-4 right-4 text-xs font-medium bg-gold/10 text-gold px-2 py-1 rounded">
                  Default
                </span>
              )}
              <h4 className="text-white font-medium text-lg mb-1">{address.label}</h4>
              <p className="text-gray-300 text-sm mb-4">{address.fullName}</p>
              
              <div className="text-gray-400 text-sm space-y-1 mb-6">
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zip}</p>
                <p>{address.country}</p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <button onClick={() => handleEdit(address)} className="text-sm text-gray-300 hover:text-gold flex items-center gap-1 transition-colors">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleDelete(address.id)} className="text-sm text-gray-300 hover:text-red-400 flex items-center gap-1 transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                {!address.isDefault && (
                  <button onClick={() => setAsDefault(address.id)} className="text-sm text-gray-300 hover:text-white ml-auto transition-colors">
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}
