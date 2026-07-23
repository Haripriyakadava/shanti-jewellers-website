import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, User, Calendar, Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/auth/AuthContext";
import { UserDropdown } from "@/components/UserDropdown";
import { WhatsAppIcon } from "@/components/icons";

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isOpeningWhatsApp, setIsOpeningWhatsApp] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // We hardcode 88 (or 120 if ticker, but let's assume 88 for global navbar)
    const navbarOffset = 88;
    const top = section.getBoundingClientRect().top + window.scrollY - navbarOffset;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  };

  const handleSectionNavigation = (sectionId: string, shouldCloseMobileMenu = false) => {
    if (shouldCloseMobileMenu) {
      setIsNavOpen(false);
    }

    if (location.pathname !== '/') {
      navigate('/#' + sectionId);
    } else {
      scrollToSection(sectionId);
    }
  };

  const openWhatsAppInquiry = async (message: string) => {
    if (isOpeningWhatsApp) return;
    setIsOpeningWhatsApp(true);
    try {
      const targetNumber = "919039039056";
      const encodedMessage = encodeURIComponent(message);
      const href = `https://wa.me/${targetNumber}?text=${encodedMessage}`;
      const openedWindow = window.open(href, "_blank", "noopener,noreferrer");
      if (!openedWindow) {
        window.location.href = href;
      }
    } catch {
      toast.error("Unable to open WhatsApp right now.");
    } finally {
      setIsOpeningWhatsApp(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal/90 backdrop-blur-md border-b border-white/5">
        <div className="section-padding">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link
              to="/"
              onClick={(e) => {
                if (location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="flex items-center gap-2 sm:gap-3"
            >
              <img
                src="/shantilogo.png"
                alt="Shanti JEWELLERY"
                width="60"
                height="56"
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-[60px] md:h-14 object-contain"
              />
              <span className="font-serif text-lg sm:text-xl tracking-wider uppercase text-white">
                SHANTI <span className="text-gold">JEWELLERY</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <button onClick={() => handleSectionNavigation("collections")} className="nav-link text-xs xl:text-sm tracking-widest uppercase text-white hover:text-gold transition-colors">Collections</button>
              <button onClick={() => handleSectionNavigation("featured")} className="nav-link text-xs xl:text-sm tracking-widest uppercase text-white hover:text-gold transition-colors">Featured</button>
              <button onClick={() => handleSectionNavigation("categories")} className="nav-link text-xs xl:text-sm tracking-widest uppercase text-white hover:text-gold transition-colors">Categories</button>
              <button onClick={() => handleSectionNavigation("products")} className="nav-link text-xs xl:text-sm tracking-widest uppercase text-white hover:text-gold transition-colors">Shop</button>
              <button onClick={() => handleSectionNavigation("trust")} className="nav-link text-xs xl:text-sm tracking-widest uppercase text-white hover:text-gold transition-colors">About</button>
              <button onClick={() => handleSectionNavigation("story")} className="nav-link text-xs xl:text-sm tracking-widest uppercase text-white hover:text-gold transition-colors">Our Story</button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4 text-white">
              <Link to="/search" className="p-1.5 sm:p-2 hover:text-gold transition-colors" aria-label="Search">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              <Link to="/account/wishlist" className="p-1.5 sm:p-2 hover:text-gold transition-colors relative" aria-label="Wishlist">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              <Link to="/cart" className="p-1.5 sm:p-2 hover:text-gold transition-colors relative" aria-label="Cart">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              
              {isAuthenticated ? (
                <UserDropdown />
              ) : (
                <Link to="/login" className="p-1.5 sm:p-2 hover:text-gold transition-colors flex items-center gap-1">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline-block text-sm font-medium">Login</span>
                </Link>
              )}

              {/* Mobile Menu */}
              <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <button className="p-1.5 sm:p-2">
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-charcoal border-white/10 w-[85vw] sm:w-80 overflow-y-auto">
                  <div className="flex flex-col gap-6 mt-8 text-white">
                    <button onClick={() => handleSectionNavigation("collections", true)} className="text-lg hover:text-gold transition-colors text-left">Collections</button>
                    <button onClick={() => handleSectionNavigation("featured", true)} className="text-lg hover:text-gold transition-colors text-left">Featured</button>
                    <button onClick={() => handleSectionNavigation("categories", true)} className="text-lg hover:text-gold transition-colors text-left">Categories</button>
                    <button onClick={() => handleSectionNavigation("products", true)} className="text-lg hover:text-gold transition-colors text-left">Shop</button>
                    <button onClick={() => handleSectionNavigation("trust", true)} className="text-lg hover:text-gold transition-colors text-left">About</button>
                    <button onClick={() => handleSectionNavigation("story", true)} className="text-lg hover:text-gold transition-colors text-left">Our Story</button>
                    
                    {isAuthenticated ? (
                      <Link to="/account" onClick={() => setIsNavOpen(false)} className="text-lg hover:text-gold transition-colors flex items-center gap-2">
                        <User className="w-5 h-5" /> Account
                      </Link>
                    ) : (
                      <Link to="/login" onClick={() => setIsNavOpen(false)} className="text-lg hover:text-gold transition-colors flex items-center gap-2">
                        <User className="w-5 h-5" /> Login
                      </Link>
                    )}

                    <Link to="/account/wishlist" onClick={() => setIsNavOpen(false)} className="text-lg hover:text-gold transition-colors flex items-center gap-2">
                      <Heart className="w-5 h-5" /> Wishlist
                    </Link>

                    <Link to="/cart" onClick={() => setIsNavOpen(false)} className="text-lg hover:text-gold transition-colors flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" /> Cart
                    </Link>
                    
                    <hr className="border-white/10" />
                    <Button onClick={() => { setIsNavOpen(false); setIsWhatsAppDialogOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white w-full">
                      <WhatsAppIcon className="w-5 h-5 mr-2" /> Enquire on WhatsApp
                    </Button>
                    <Button onClick={() => { setIsNavOpen(false); setIsAppointmentDialogOpen(true); }} variant="outline" className="border-gold text-gold hover:bg-gold hover:text-charcoal w-full">
                      <Calendar className="w-5 h-5 mr-2" /> Book Appointment
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Shared WhatsApp Dialog */}
      <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
        <DialogContent className="bg-charcoal border-white/10 max-w-[90vw] md:max-w-md mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl md:text-2xl text-white text-center">Enquire on WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4 md:py-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <WhatsAppIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <p className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base px-2">
              Connect with us directly on WhatsApp for instant assistance and personalized recommendations.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => void openWhatsAppInquiry("Hi, I'm interested in your jewelry collection.")}
                disabled={isOpeningWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 md:py-3 px-4 md:px-6 rounded flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
              >
                <WhatsAppIcon className="w-4 h-4 md:w-5 md:h-5" />
                {isOpeningWhatsApp ? "Opening..." : "Start Chat"}
              </button>
              <Button variant="outline" onClick={() => setIsWhatsAppDialogOpen(false)} className="w-full border-white/20 text-white hover:bg-white/10 text-sm md:text-base">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shared Appointment Dialog */}
      <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
        <DialogContent className="bg-charcoal border-white/10 max-w-[90vw] md:max-w-md mx-auto rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl md:text-2xl text-white text-center">Book an Appointment</DialogTitle>
          </DialogHeader>
          <div className="py-4 md:py-6">
            <p className="text-gray-300 text-center mb-4 md:mb-6 text-sm md:text-base">
              Schedule a personalized consultation with our jewelry experts at our Nellore branch.
            </p>
            <form className="space-y-3 md:space-y-4">
              <div>
                <label className="text-gray-400 text-xs md:text-sm block mb-1.5 md:mb-2">Full Name</label>
                <input type="text" className="w-full bg-charcoal-light border border-white/10 text-white px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:border-gold focus:outline-none rounded-sm" placeholder="Enter your name" />
              </div>
              <div>
                <label className="text-gray-400 text-xs md:text-sm block mb-1.5 md:mb-2">Phone Number</label>
                <input type="tel" className="w-full bg-charcoal-light border border-white/10 text-white px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:border-gold focus:outline-none rounded-sm" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="text-gray-400 text-xs md:text-sm block mb-1.5 md:mb-2">Preferred Date</label>
                <input type="date" className="w-full bg-charcoal-light border border-white/10 text-white px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:border-gold focus:outline-none rounded-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-xs md:text-sm block mb-1.5 md:mb-2">Message (Optional)</label>
                <textarea className="w-full bg-charcoal-light border border-white/10 text-white px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:border-gold focus:outline-none resize-none rounded-sm" rows={3} placeholder="What are you looking for?" />
              </div>
              <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-charcoal font-medium py-2.5 md:py-3 text-sm md:text-base mt-2">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Request Appointment
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
