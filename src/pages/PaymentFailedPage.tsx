import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCcw, Headphones, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-red-50 p-8 flex flex-col items-center border-b border-red-100">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm"
          >
            <XCircle className="w-12 h-12 text-red-600" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2 text-center"
          >
            Payment Failed
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 text-center max-w-sm"
          >
            We couldn't verify your payment. Your account has not been charged for this transaction.
          </motion.p>
        </div>

        <div className="p-8 space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button 
              onClick={() => navigate('/checkout/payment')}
              className="w-full h-12 text-lg bg-[#D4AF37] hover:bg-[#b8952b] text-white shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" />
              Retry Payment
            </Button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button 
              variant="outline" 
              onClick={() => navigate('/contact')}
              className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              Contact Support
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex-1 h-12 text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
