import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { toast } from 'sonner';
import { SeoHead } from '@/components/SeoHead';
import { Navbar } from '@/components/Navbar';
import { Lock, ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetPassword, loading } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await resetPassword(password);
      toast.success('Password successfully reset. You can now login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };


  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center py-12 pt-32 px-4 sm:px-6 lg:px-8">
      <SeoHead />
      <Navbar />
      
      <div className="max-w-md w-full space-y-8 card-luxury p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gold">
            Set New Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Please enter your new password below
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full pl-10 px-3 py-3 border border-gray-700 bg-charcoal-light placeholder-gray-500 text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm transition-colors"
                  placeholder="New Password"
                />
              </div>

            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full pl-10 px-3 py-3 border border-gray-700 bg-charcoal-light placeholder-gray-500 text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm transition-colors"
                  placeholder="Confirm New Password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-charcoal bg-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold focus:ring-offset-charcoal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-400">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-gold hover:text-yellow-400 transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
