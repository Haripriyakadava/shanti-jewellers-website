import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { toast } from 'sonner';
import { SeoHead } from '@/components/SeoHead';
import { Navbar } from '@/components/Navbar';
import { Mail, Lock, User, Phone, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });
  
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!formData.agreedToTerms) {
      toast.error('You must agree to the terms and conditions');
      return;
    }

    try {
      await register({
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phone,
        password: formData.password
      });
      
      toast.success('Registration successful! Welcome to Shanti Jewellers.');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Email might already be in use.');
    }
  };


  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center py-12 pt-32 px-4 sm:px-6 lg:px-8">
      <SeoHead />
      <Navbar />
      
      <div className="max-w-md w-full space-y-8 card-luxury p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gold">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Join us to experience unparalleled luxury
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full pl-10 px-3 py-3 border border-gray-700 bg-charcoal-light placeholder-gray-500 text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm transition-colors"
                  placeholder="Full Name"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full pl-10 px-3 py-3 border border-gray-700 bg-charcoal-light placeholder-gray-500 text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm transition-colors"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="sr-only">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full pl-10 px-3 py-3 border border-gray-700 bg-charcoal-light placeholder-gray-500 text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm transition-colors"
                  placeholder="Phone Number (Optional)"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full pl-10 px-3 py-3 border border-gray-700 bg-charcoal-light placeholder-gray-500 text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm transition-colors"
                  placeholder="Password"
                />
              </div>

            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full pl-10 px-3 py-3 border border-gray-700 bg-charcoal-light placeholder-gray-500 text-white focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm transition-colors"
                  placeholder="Confirm Password"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="agreedToTerms"
                name="agreedToTerms"
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-gold focus:ring-gold border-gray-700 rounded bg-charcoal-light accent-gold"
              />
              <label htmlFor="agreedToTerms" className="ml-2 block text-sm text-gray-400">
                I agree to the <Link to="/terms" className="text-gold hover:text-yellow-400">Terms and Conditions</Link>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-charcoal bg-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold focus:ring-offset-charcoal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-gold hover:text-yellow-400 transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
