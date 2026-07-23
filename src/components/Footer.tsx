import { MapPin, Phone, Mail } from 'lucide-react';
import { WhatsAppIcon } from './icons';
import { openWhatsAppInquiry } from '@/lib/whatsapp';

export function Footer() {
  return (
    <footer className="py-12 md:py-16 section-padding bg-charcoal-dark border-t border-white/5 mt-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-10 md:mb-12 max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-2 md:gap-3 mb-4">
            <img
              src="/shantilogo.png"
              alt="Shanti JEWELLERY Logo Nellore"
              loading="lazy"
              className="w-10 h-10 md:w-12 md:h-12 lg:w-[60px] lg:h-14 object-contain"
            />
            <span className="font-serif text-lg md:text-xl tracking-wider uppercase text-white">
              SHANTI <span className="text-gold">JEWELLERY</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs md:text-sm mb-6 leading-relaxed">
            Crafting timeless elegance since 1960. Your trusted destination
            for exquisite gold and diamond jewelry in Nellore.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/shantijewellery01/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:border-gold transition-colors"
            >
              <img
                src="/fblogo.png"
                alt="Facebook"
                className="w-5 h-5 md:w-6 md:h-6 object-contain"
                loading="lazy"
                decoding="async"
              />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/shanti_jewellery1960/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:border-gold transition-colors"
            >
              <img
                src="/intalogo.png"
                alt="Instagram"
                className="w-5 h-5 md:w-6 md:h-6 object-contain"
                loading="lazy"
                decoding="async"
              />
            </a>

            {/* YouTube */}
            <a
              href="https://youtu.be/M3qSUH2_soo?si=62Pz0jD-wNiXmZiX"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:border-gold transition-colors"
            >
              <img
                src="/youtubeicon.png"
                alt="YouTube"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
                loading="lazy"
                decoding="async"
              />
            </a>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => {
                void openWhatsAppInquiry(
                  "Hi, I am interested in your jewelry collection.",
                );
              }}
              aria-label="WhatsApp"
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:text-gold transition-colors text-white"
            >
              <WhatsAppIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-base md:text-lg text-white mb-4 md:mb-6">
            Quick Links
          </h4>
          <ul className="space-y-2 md:space-y-3">
            <li>
              <a
                href="/#collections"
                className="text-gray-400 hover:text-gold transition-colors text-xs md:text-sm"
              >
                Collections
              </a>
            </li>
            <li>
              <a
                href="/#featured"
                className="text-gray-400 hover:text-gold transition-colors text-xs md:text-sm"
              >
                Featured
              </a>
            </li>
            <li>
              <a
                href="/#products"
                className="text-gray-400 hover:text-gold transition-colors text-xs md:text-sm"
              >
                Shop
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-base md:text-lg text-white mb-4 md:mb-6">
            Customer Service
          </h4>
          <ul className="space-y-2 md:space-y-3">
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-gold transition-colors text-xs md:text-sm"
              >
                Contact Us
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-gold transition-colors text-xs md:text-sm"
              >
                Shipping Info
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-gold transition-colors text-xs md:text-sm"
              >
                Returns & Exchanges
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-gold transition-colors text-xs md:text-sm"
              >
                Size Guide
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-base md:text-lg text-white mb-4 md:mb-6">
            Contact
          </h4>
          <ul className="space-y-3 md:space-y-4">
            <li className="flex items-start gap-2 md:gap-3">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gold flex-shrink-0 mt-0.5" />
              <span className="text-gray-400 text-xs md:text-sm leading-relaxed">
                2-148, Barkas Center, 17, Achari St, beside SBI, VRC Centre,
                Nellore, Andhra Pradesh 524001
              </span>
            </li>
            <li className="flex items-center gap-2 md:gap-3">
              <Phone className="w-4 h-4 md:w-5 md:h-5 text-gold flex-shrink-0" />
              <span className="text-gray-400 text-xs md:text-sm">
                +91 90390 39056
              </span>
            </li>
            <li className="flex items-center gap-2 md:gap-3">
              <Mail className="w-4 h-4 md:w-5 md:h-5 text-gold flex-shrink-0" />
              <span className="text-gray-400 text-xs md:text-sm break-all">
                info@shantijewellery.com
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-6 md:pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left max-w-7xl mx-auto">
        <div className="items-center">
          <p className="text-gray-500 text-xs md:text-sm">
            © 2026 SHANTI JEWELLERY. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <a
            href="#"
            className="text-gray-500 hover:text-gold transition-colors text-xs md:text-sm"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-gray-500 hover:text-gold transition-colors text-xs md:text-sm"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
