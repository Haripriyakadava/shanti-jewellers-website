import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/auth/AuthContext';
import { getItem, setItem, StorageKeys } from '@/auth/storage';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

export default function ChangePassword() {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const users = getItem<any[]>(StorageKeys.USERS) || [];
      const userIndex = users.findIndex(u => u.id === currentUser?.id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Check old password
      if (users[userIndex].password !== formData.oldPassword) {
        throw new Error('Incorrect current password');
      }

      // Update password
      users[userIndex].password = formData.newPassword;
      setItem(StorageKeys.USERS, users);
      
      toast.success('Password updated successfully');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Change Password">
      <div className="max-w-md">
        <div className="mb-6 flex items-center gap-3 text-gray-400 bg-white/5 p-4 rounded-lg border border-white/5">
          <KeyRound className="w-5 h-5 text-gold flex-shrink-0" />
          <p className="text-sm">Your new password must be at least 6 characters long. We recommend using a mix of letters, numbers, and symbols.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Current Password</label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:outline-none focus:border-gold transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:outline-none focus:border-gold transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-charcoal-light border border-white/10 rounded-md text-white focus:outline-none focus:border-gold transition-colors"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2 bg-gold text-charcoal font-medium rounded-md hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
