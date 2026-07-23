import { ArrowLeft, MessageCircle, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { openWhatsAppInquiry } from '@/lib/whatsapp';

interface CheckoutHeaderProps {
  currentStep: 1 | 2 | 3;
}

export function CheckoutHeader({ currentStep }: CheckoutHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-charcoal/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
          {/* Logo and Back Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/shantilogo.png"
                alt="Shanti JEWELLERY"
                className="w-10 h-10 object-contain"
              />
              <div className="hidden sm:block">
                <span className="font-serif text-lg tracking-wider uppercase text-white block leading-tight">
                  SHANTI
                </span>
                <span className="font-serif text-xs tracking-wider uppercase text-gold block leading-tight">
                  JEWELLERY
                </span>
              </div>
            </Link>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center flex-1 max-w-lg mx-auto">
            <div className="flex items-center w-full relative">
              {/* Step 1 */}
              <div className="flex items-center gap-2 z-10 bg-charcoal px-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep > 1 ? 'bg-green-600 text-white' : currentStep === 1 ? 'bg-gold text-charcoal' : 'bg-gray-600 text-gray-300'}`}>
                  {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : 1}
                </div>
                <span className={`text-sm ${currentStep >= 1 ? 'text-white font-medium' : 'text-gray-400'}`}>Summary</span>
              </div>
              
              <div className={`flex-1 h-px mx-2 ${currentStep >= 2 ? 'bg-gold' : 'bg-gray-700'}`}></div>

              {/* Step 2 */}
              <div className="flex items-center gap-2 z-10 bg-charcoal px-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep > 2 ? 'bg-green-600 text-white' : currentStep === 2 ? 'bg-gold text-charcoal' : 'bg-gray-600 text-gray-300'}`}>
                  {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : 2}
                </div>
                <span className={`text-sm ${currentStep >= 2 ? 'text-white font-medium' : 'text-gray-400'}`}>Address</span>
              </div>

              <div className={`flex-1 h-px mx-2 ${currentStep >= 3 ? 'bg-gold' : 'bg-gray-700'}`}></div>

              {/* Step 3 */}
              <div className="flex items-center gap-2 z-10 bg-charcoal px-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep === 3 ? 'bg-gold text-charcoal' : 'bg-gray-600 text-gray-300'}`}>
                  3
                </div>
                <span className={`text-sm ${currentStep >= 3 ? 'text-white font-medium' : 'text-gray-400'}`}>Payment</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => void openWhatsAppInquiry("Hi, I need assistance with my checkout.")}
              className="bg-[#587e4c] hover:bg-[#46663c] text-white rounded-md flex items-center gap-2 px-4 h-9 text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Get Whatsapp Assistance</span>
              <span className="sm:hidden">Assistance</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
