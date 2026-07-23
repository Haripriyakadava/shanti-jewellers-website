import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/auth/AuthContext';
import { toast } from 'sonner';

export default function Profile() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: currentUser?.full_name || '',
    phone_number: currentUser?.phone_number || '',
    dob: currentUser?.dob || '',
    anniversary: currentUser?.anniversary || '',
    spouse_name: currentUser?.spouse_name || '',
    spouse_dob: currentUser?.spouse_dob || '',
    pan_number: currentUser?.pan_number || '',
    marital_status: currentUser?.marital_status || 'Single',
  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      full_name: currentUser?.full_name || '',
      phone_number: currentUser?.phone_number || '',
      dob: currentUser?.dob || '',
      anniversary: currentUser?.anniversary || '',
      spouse_name: currentUser?.spouse_name || '',
      spouse_dob: currentUser?.spouse_dob || '',
      pan_number: currentUser?.pan_number || '',
      marital_status: currentUser?.marital_status || 'Single',
    });
    setIsEditing(false);
  };

  return (
    <DashboardLayout title="">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-white/10 gap-4">
        <h2 className="text-2xl font-serif text-white">Personal Information</h2>
        {!isEditing && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-gold text-gold rounded-md hover:bg-gold hover:text-charcoal transition-colors font-medium text-sm"
            >
              Edit information
            </button>
            <button 
              onClick={() => navigate('/account/change-password')}
              className="px-4 py-2 bg-gold text-charcoal rounded-md hover:bg-gold/90 transition-colors font-medium text-sm"
            >
              Change Password
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-8">


          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p className="text-sm text-gray-400 mb-1">Name*</p>
              <p className="text-white font-medium">{currentUser?.full_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Mobile Number*</p>
              <p className="text-white font-medium">{currentUser?.phone_number || '-'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-1">Email Address*</p>
              <p className="text-white font-medium">{currentUser?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Date of Birth*</p>
              <p className="text-white font-medium">{currentUser?.dob || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Wedding Anniversary*</p>
              <p className="text-white font-medium">{currentUser?.anniversary || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Spouse's Name</p>
              <p className="text-white font-medium">{currentUser?.spouse_name || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Spouse's DoB</p>
              <p className="text-white font-medium">{currentUser?.spouse_dob || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Marital Status</p>
              <p className="text-white font-medium">{currentUser?.marital_status || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Pan Number*</p>
              <p className="text-white font-medium">{currentUser?.pan_number || '-'}</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Name*</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:outline-none focus:border-gold transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Mobile Number*</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:outline-none focus:border-gold transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address*</label>
              <input
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-charcoal/50 border border-white/5 rounded-md text-gray-500 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Date of Birth*</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Marital Status</label>
              <select
                name="marital_status"
                value={formData.marital_status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:outline-none focus:border-gold transition-colors"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Pan Number*</label>
              <input
                type="text"
                name="pan_number"
                value={formData.pan_number}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            {formData.marital_status === 'Married' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Wedding Anniversary*</label>
                  <input
                    type="date"
                    name="anniversary"
                    value={formData.anniversary}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Spouse's Name</label>
                  <input
                    type="text"
                    name="spouse_name"
                    value={formData.spouse_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Spouse's DoB</label>
                  <input
                    type="date"
                    name="spouse_dob"
                    value={formData.spouse_dob}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </>
            )}
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gold text-charcoal font-medium rounded-md hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSubmitting}
              className="px-6 py-2 border border-white/20 text-white font-medium rounded-md hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
