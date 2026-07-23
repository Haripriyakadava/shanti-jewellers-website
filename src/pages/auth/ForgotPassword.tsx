import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { toast } from 'sonner';
import { SeoHead } from '@/components/SeoHead';
import { Navbar } from '@/components/Navbar';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  
  const { forgotPassword, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await forgotPassword(email);
      setIsSent(true);
      toast.success('Password reset link simulated successfully.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to process request');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center py-12 pt-32 px-4 sm:px-6 lg:px-8">
      <SeoHead />
      <Navbar />
      
      <div className="max-w-md w-full space-y-8 card-luxury p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gold">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email to receive a password reset link
          </p>
        </div>
        
        {!isSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full pl-10 px-3 py-3 border border-gray-700 bg-charcoal-light placeholder-gray-500 text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm transition-colors"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-charcoal bg-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold focus:ring-offset-charcoal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center bg-charcoal-light p-6 rounded-md border border-gray-700">
            <p className="text-gray-300">
              If an account exists for <span className="font-semibold text-white">{email}</span>, you will receive password reset instructions.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              (In this demo, the link is simulated. You can proceed to the reset password page manually.)
            </p>
            <div className="mt-6">
              <Link
                to="/reset-password"
                className="inline-flex items-center text-sm font-medium text-gold hover:text-yellow-400 transition-colors"
              >
                Proceed to Reset Password Page
              </Link>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex items-center justify-center">
          <Link to="/login" className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
