import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "sonner";
import {
  Menu,
  Phone,
  Mail,
  MapPin,
  Heart,
  Search,
  Award,
  Shield,
  Gem,
  ShoppingBag,
  ArrowRight,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { SeoHead } from "./components/SeoHead";

// Custom WhatsApp Icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { useCart } from "@/context/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { collections as localLandingCollections } from "@/data/collections";
import {
  getShopStorageEventName,
  getWishlistIds,
} from "@/lib/shop-storage";
import {
  fetchAllCategories,
  fetchAllCollections,
  fetchMetalPriceTicker,
  type ShopProductCard,
  type ShopCollection,
  type ShopMetalPriceTickerItem,
} from "@/lib/shop-api";

gsap.registerPlugin(ScrollTrigger);

export const StarIcon = () => (
  <svg
    className="w-4 h-4 md:w-5 md:h-5 text-gold fill-gold"
    viewBox="0 0 24 24"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export const GoogleIcon = () => (
  <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const InstagramIcon = () => (
  <svg
    className="w-5 h-5 md:w-6 md:h-6 text-pink-500"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

export const FacebookIcon = () => (
  <svg
    className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const googleReviews = [
  {
    id: 1,
    name: "Kishan Reddy",
    time: "10 months ago",
    text: "After exploring few gold shops in Nellore, I found very fresh and unique designs here. The best thing is customisation is done exactly according to my requirements!",
  },
  {
    id: 2,
    name: "Bhachu Hemavathi",
    time: "4 months ago",
    text: "Best jewellery shop in Nellore. Very nice models, honest purity, and less price compared to the market showrooms.",
  },
  {
    id: 3,
    name: "Vivek Panchananam",
    time: "1 year ago",
    text: "Worked with Dixit to create a custom engagement ring. We consulted every week on every small detail of this ring. Exceptional workmanship and attention to detail!",
  },
  {
    id: 4,
    name: "Keerthy Gangavarapu",
    time: "2 months ago",
    text: "I purchased a set of gold earrings online seeing their Instagram page. From day one, they gave daily updates and the secure shipping was done very safely. Best for online gold purchases!",
  },
  {
    id: 5,
    name: "Parvez Muskana",
    time: "9 months ago",
    text: "I recently purchased gold earring studs from Shanthi Jewellers and couldn't be happier with the elegant design finishing and modern luxury touch.",
  },
  {
    id: 6,
    name: "Maddisetty Sravani",
    time: "3 months ago",
    text: "Good receiving, polite staff, and very nice collection of bridal jewelry at the best price. Thank you so much sir!",
  },
  {
    id: 7,
    name: "Swapna Reddy",
    time: "2 years ago",
    text: "Best jewellery shop in nellore. Selective unique designs, low wastage, low price, and high quality. Bangaru konali ante SHANTI JEWELRY ki ravalsinde!",
  },
  {
    id: 8,
    name: "Sai Reddy",
    time: "2 months ago",
    text: "Models are very beautiful. No one has these premium lightweight gold jewellery models in Nellore. Friendly staff with great patience.",
  },
  {
    id: 9,
    name: "Bike Kumar143",
    time: "10 months ago",
    text: "Super shop. We have been purchasing our gold ornaments here for over 20 years. Full trust, high guarantee, and pure relation.",
  },
  {
    id: 10,
    name: "Sambhawaami Studios",
    time: "3 months ago",
    text: "Variety and grand collections. We specifically travelled all the way from Tirupati to their Nellore store after seeing their unique Instagram posts!",
  },
  {
    id: 11,
    name: "Mrudula Gollapudi",
    time: "1 year ago",
    text: "This shop has a very wide range of collections, especially their contemporary diamond jewellery is stunning. Shared a necklace image and they made an exact, beautiful replica.",
  },
  {
    id: 12,
    name: "Srikanth Vinnamala",
    time: "11 months ago",
    text: "Excellent place for gold and silver in Nellore near VRC centre. Has a lot of models and reasonable pricing on wastage.",
  },
  {
    id: 13,
    name: "Gokarnam Revathi",
    time: "4 years ago",
    text: "Very reasonable price and less wastage than the market. Totally BIS Hallmarked gold jewellery. I am happy and satisfied with the custom design and discounts.",
  },
  {
    id: 14,
    name: "Priyanka Avisa",
    time: "3 years ago",
    text: "I ordered custom gold anklets which were delivered in just one day! The design is beautiful. If you have any bridal design in mind, they bring it to life.",
  },
  {
    id: 15,
    name: "Jyothi Avisa",
    time: "4 years ago",
    text: "Excellent designs. We purchased our traditional tali chain and gold necklace last time. Very reasonable price and high certified quality.",
  },
  {
    id: 16,
    name: "Srinivasulu Tr",
    time: "3 months ago",
    text: "Very good contemporary and traditional gold designs with the best discount prices in Nellore market.",
  },
  {
    id: 17,
    name: "Sai Swetha K.",
    time: "1 week ago",
    text: "Good experience and nice collection. Will definitely recommend Shanti Jewellers for anyone looking for bridal gold designs.",
  },
  {
    id: 18,
    name: "Dayakar Reddy",
    time: "1 year ago",
    text: "Shanti shop is very good and the hospitality is great. The jewellery layout is nice and they received us very well. Must visit!",
  },
  {
    id: 19,
    name: "Neeraja Velineni",
    time: "2 years ago",
    text: "The counter staff is nice, professional, and deeply caring. They show models with infinite patience until you find the right fit.",
  },
  {
    id: 20,
    name: "Mohammed Khan",
    time: "4 years ago",
    text: "Got the best exchange value for my old gold items when purchasing a new gold ring here. Highly transparent and clear process.",
  },
];

const fallbackLandingCollections: ShopCollection[] =
  localLandingCollections.map((collection, index) => ({
    id: index + 1,
    name: collection.name,
    slug: collection.slug,
    subtitle: collection.subtitle,
    description: collection.description,
    image: collection.image,
  }));

const jewelleryTypes = [
  {
    id: 1,
    name: "Gold Jewellery",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600",
    description: "Pure and radiant 22K & 24K gold ornaments for every occasion.",
  },
  {
    id: 2,
    name: "Diamond Jewellery",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600",
    description: "Brilliant IGI certified diamonds set in exquisite designs.",
  },
  {
    id: 3,
    name: "Silver Jewellery",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600",
    description: "Elegant and contemporary silver pieces for daily wear.",
  },
  {
    id: 4,
    name: "Platinum Jewellery",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=600",
    description: "Rare and timeless platinum bands and delicate chains.",
  },
  {
    id: 5,
    name: "Bridal Jewellery",
    image: "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&q=80&w=600",
    description: "Majestic heirloom collections designed for your special day.",
  },
  {
    id: 6,
    name: "Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Elegant solitaire, halo, and classic wedding bands.",
  },
  {
    id: 7,
    name: "Earrings",
    image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=600",
    description: "Classic studs, traditional jhumkas, and contemporary drops.",
  },
  {
    id: 8,
    name: "Necklaces",
    image: "https://images.unsplash.com/photo-1685970731194-e27b477e87ba?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Stunning traditional harams and modern statement neckpieces.",
  },
  {
    id: 9,
    name: "Chains",
    image: "https://images.unsplash.com/photo-1708220040856-131e4f86a1aa?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Durable, hand-woven rope, cuban, and classic chains.",
  },
  {
    id: 10,
    name: "Pendants",
    image: "https://images.unsplash.com/photo-1531995811006-35cb42e1a022?auto=format&fit=crop&q=80&w=600",
    description: "Delicate floral, lightweight, and modern daily-wear pendants.",
  },
  {
    id: 11,
    name: "Bangles",
    image: "https://images.unsplash.com/photo-1679156271456-d6068c543ee7?q=80&w=711&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Exquisite hand-carved kadas and traditional bangles.",
  },
  {
    id: 12,
    name: "Bracelets",
    image: "https://images.unsplash.com/photo-1689367436629-1d288f1e23b6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Delicate charm bracelets and modern luxury wrist-wear.",
  }
];

const PRIORITY_COLLECTION_SLUGS = [
  "gold-classics",
  "bridal-collection",
  "diamond-essentials",
] as const;

const fallbackGoldPriceTicker: ShopMetalPriceTickerItem[] = [];

type HomeCategory = {
  id: number;
  name: string;
  slug: string;
  image: string;
};

function App() {
  const isMobile = useIsMobile();
  const { totalItems } = useCart();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedProduct] =
    useState<ShopProductCard | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>(() => getWishlistIds());

  // Category State
  const [landingCategories, setLandingCategories] = useState<HomeCategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const [isHeroVideoReady, setIsHeroVideoReady] = useState(false);
  const [isBridalVideoReady, setIsBridalVideoReady] = useState(false);
  const [hasBridalVideoError, setHasBridalVideoError] = useState(false);
  const [isGoldClassicsVideoReady, setIsGoldClassicsVideoReady] =
    useState(false);
  const [hasGoldClassicsVideoError, setHasGoldClassicsVideoError] =
    useState(false);
  const [isEssentialsVideoReady, setIsEssentialsVideoReady] = useState(false);
  const [hasEssentialsVideoError, setHasEssentialsVideoError] = useState(false);
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(
    null,
  );
  const [landingCollections, setLandingCollections] = useState<
    ShopCollection[]
  >(fallbackLandingCollections);

  const [goldPriceTicker, setGoldPriceTicker] = useState<
    ShopMetalPriceTickerItem[]
  >(fallbackGoldPriceTicker);
  const [isOpeningWhatsApp, setIsOpeningWhatsApp] = useState(false);
  const [shouldPlayHeroVideo] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const prefersSaveData = Boolean(connection?.saveData);
    return !(prefersReducedMotion || prefersSaveData);
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const seoSectionRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const reviewCarouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  // Live Market Rates State
  const [_liveRates, _setLiveRates] = useState({
    gold24k: 0,
    gold22k: 0,
    silver: 0,
    loading: true,
    lastUpdated: "",
  });

  const openWhatsAppInquiry = async (message: string) => {
    if (isOpeningWhatsApp) {
      return;
    }

    setIsOpeningWhatsApp(true);

    try {
      // 1. Hardcoded target WhatsApp number (91 + your 10 digit number)
      const targetNumber = "919039039056";

      // 2. Encode the message so it formats correctly in the URL
      const encodedMessage = encodeURIComponent(message);

      // 3. Create the official wa.me link
      const href = `https://wa.me/${targetNumber}?text=${encodedMessage}`;

      // 4. Open WhatsApp in a new tab
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(".hero-title", {
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.3,
      });

      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        delay: 0.6,
      });

      gsap.from(".hero-cta", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.9,
      });

      // Collection section
      gsap.from(".collection-title", {
        scrollTrigger: {
          trigger: collectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        x: -50,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".collection-card", {
        scrollTrigger: {
          trigger: collectionRef.current,
          start: "top 70%",
        },
        opacity: 0,
        x: 100,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      // Featured section
      gsap.from(".featured-content", {
        scrollTrigger: {
          trigger: featuredRef.current,
          start: "top 75%",
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
      });

      // Category section
      gsap.from(".category-card", {
        scrollTrigger: {
          trigger: categoryRef.current,
          start: "top 75%",
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });

      // Products section
      gsap.fromTo(
        ".product-card",
        {
          opacity: 0,
          y: 40,
        },
        {
          scrollTrigger: {
            trigger: productsRef.current,
            start: "top 75%",
            invalidateOnRefresh: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          immediateRender: false,
        },
      );

      // Trust section
      gsap.from(".trust-item", {
        scrollTrigger: {
          trigger: trustRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });

      // Story section
      gsap.from(".story-content", {
        scrollTrigger: {
          trigger: storyRef.current,
          start: "top 75%",
        },
        opacity: 0,
        x: 50,
        duration: 1,
        ease: "power3.out",
      });

      // SEO Block Reveal
      gsap.from(".seo-content-block", {
        scrollTrigger: {
          trigger: seoSectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      // Advanced Map Card Reveal
      gsap.from(".map-floating-card", {
        scrollTrigger: {
          trigger: mapSectionRef.current,
          start: "top 60%",
        },
        opacity: 0,
        y: 50,
        backdropFilter: "blur(0px)",
        duration: 1.2,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const syncWishlist = () => setWishlist(getWishlistIds());
    const shopStorageEvent = getShopStorageEventName();

    window.addEventListener(shopStorageEvent, syncWishlist);
    window.addEventListener("storage", syncWishlist);

    return () => {
      window.removeEventListener(shopStorageEvent, syncWishlist);
      window.removeEventListener("storage", syncWishlist);
    };
  }, []);

  // Fetch Free Live Gold & Silver API (No Key Required)
  useEffect(() => {
    const fetchLiveRates = async () => {
      try {
        const [goldRes, silverRes] = await Promise.all([
          fetch(
            "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json",
          ),
          fetch(
            "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xag.json",
          ),
        ]);

        if (!goldRes.ok || !silverRes.ok) {
          throw new Error("API request failed");
        }

        const goldData = await goldRes.json();
        const silverData = await silverRes.json();

        const goldInr = goldData?.xau?.inr;
        const silverInr = silverData?.xag?.inr;

        if (!goldInr || !silverInr) {
          throw new Error("Invalid API response");
        }

        const TROY_OUNCE_IN_GRAMS = 31.1034768;
        const INDIAN_PREMIUM = 1.15;

        const gold24k = Math.round(
          (goldInr / TROY_OUNCE_IN_GRAMS) * INDIAN_PREMIUM,
        );

        const gold22k = Math.round(gold24k * (22 / 24));

        const silver = Math.round(
          (silverInr / TROY_OUNCE_IN_GRAMS) * INDIAN_PREMIUM,
        );

        _setLiveRates({
          gold24k,
          gold22k,
          silver,
          loading: false,
          lastUpdated: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      } catch (error) {
        console.error("Failed to fetch live metal rates:", error);

        _setLiveRates((prev: any) => ({
          ...prev,
          loading: false,
        }));
      }
    };

    fetchLiveRates();

    const interval = setInterval(fetchLiveRates, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    setIsCategoriesLoading(true);

    const loadHomeContent = async () => {
      const [
        collectionsResult,
        categoriesResult,
        goldPricesResult,
      ] = await Promise.allSettled([
        fetchAllCollections(),
        fetchAllCategories(),
        fetchMetalPriceTicker(),
      ]);

      if (!isMounted) {
        return;
      }

      if (collectionsResult.status === "fulfilled") {
        setLandingCollections(collectionsResult.value);
      } else {
        setLandingCollections(fallbackLandingCollections);
        toast.error(
          "Unable to load collections from Supabase. Showing local lookbook.",
        );
      }

      // Load Categories from Supabase
      if (categoriesResult.status === "fulfilled") {
        setLandingCategories(
          categoriesResult.value.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            image: category.image || "/cat-rings.jpg",
          }))
        );
      } else {
        setLandingCategories([]);
        toast.error("Unable to load categories from Supabase.");
      }
      setIsCategoriesLoading(false);

      if (
        goldPricesResult.status === "fulfilled" &&
        goldPricesResult.value.length > 0
      ) {
        setGoldPriceTicker(goldPricesResult.value);
      } else {
        setGoldPriceTicker(fallbackGoldPriceTicker);
      }
    };

    void loadHomeContent();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll logic for Google Reviews carousel
  useEffect(() => {
    if (isCarouselHovered) return;

    const carousel = reviewCarouselRef.current;
    if (!carousel) return;

    const scrollInterval = setInterval(() => {
      const firstChild = carousel.firstElementChild as HTMLElement;
      if (!firstChild) return;

      // Card width + Gap spacing
      const scrollAmount = firstChild.clientWidth + 24;

      // Check if we reached the end of the scroll
      if (
        carousel.scrollLeft + carousel.clientWidth >=
        carousel.scrollWidth - 10
      ) {
        carousel.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 3500); // Slides every 3.5 seconds

    return () => clearInterval(scrollInterval);
  }, [isCarouselHovered]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }

    const navbarOffset = hasGoldPriceTicker ? 120 : 88;
    const top =
      section.getBoundingClientRect().top + window.scrollY - navbarOffset;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  };

  const handleSectionNavigation = (
    sectionId: string,
    shouldCloseMobileMenu = false,
  ) => {
    if (shouldCloseMobileMenu) {
      setIsNavOpen(false);
    }

    scrollToSection(sectionId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const orderedCollections = useMemo(() => {
    const prioritized: ShopCollection[] = [];
    const usedIndexes = new Set<number>();

    PRIORITY_COLLECTION_SLUGS.forEach((slug) => {
      landingCollections.forEach((collection, index) => {
        if (collection.slug === slug) {
          prioritized.push(collection);
          usedIndexes.add(index);
        }
      });
    });

    const remaining = landingCollections.filter(
      (_, index) => !usedIndexes.has(index),
    );
    return [...prioritized, ...remaining];
  }, [landingCollections]);

  const goldPriceTickerItems = useMemo(() => {
    if (goldPriceTicker.length === 0) {
      return [] as string[];
    }

    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

    return goldPriceTicker.map((item) => {
      const value = formatter.format(item.price);
      return `${item.metal}: ${value} / ${item.unit}`;
    });
  }, [goldPriceTicker]);

  const hasGoldPriceTicker = goldPriceTickerItems.length > 0;

  const shouldScrollCollections = isMobile || landingCollections.length > 3;
  const shouldScrollCategories = isMobile || landingCategories.length > 4;

  return (
    <div className="min-h-screen bg-charcoal text-white overflow-x-hidden w-full relative">
      {" "}
      {/* Dynamic SEO Meta & JSON-LD injection */}
      <SeoHead />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal/90 backdrop-blur-md border-b border-white/5">


        <div className="section-padding">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 sm:gap-3"
            >
              <img
                src="/shantilogo.png"
                alt="Shanti JEWELLERY Nellore Official Logo"
                width="60"
                height="56"
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-[60px] md:h-14 object-contain"
              />
              <span className="font-serif text-lg sm:text-xl tracking-wider uppercase">
                SHANTI <span className="text-gold">JEWELLERY</span>
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <button
                type="button"
                onClick={() => handleSectionNavigation("collections")}
                className="nav-link text-xs xl:text-sm tracking-widest uppercase"
              >
                Collections
              </button>
              <button
                type="button"
                onClick={() => handleSectionNavigation("featured")}
                className="nav-link text-xs xl:text-sm tracking-widest uppercase"
              >
                Featured
              </button>
              <button
                type="button"
                onClick={() => handleSectionNavigation("categories")}
                className="nav-link text-xs xl:text-sm tracking-widest uppercase"
              >
                Categories
              </button>
              <button
                type="button"
                onClick={() => handleSectionNavigation("products")}
                className="nav-link text-xs xl:text-sm tracking-widest uppercase"
              >
                Shop
              </button>
              <button
                type="button"
                onClick={() => handleSectionNavigation("trust")}
                className="nav-link text-xs xl:text-sm tracking-widest uppercase"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => handleSectionNavigation("story")}
                className="nav-link text-xs xl:text-sm tracking-widest uppercase"
              >
                Our Story
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/search"
                className="p-1.5 sm:p-2 hover:text-gold transition-colors"
                aria-label="Search products"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link
                to="/wishlist"
                className="p-1.5 sm:p-2 hover:text-gold transition-colors relative"
                aria-label="Open wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] sm:min-w-5 sm:h-5 px-1 bg-gold text-charcoal text-[9px] sm:text-[10px] rounded-full flex items-center justify-center font-semibold">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                className="p-1.5 sm:p-2 hover:text-gold transition-colors relative"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] sm:min-w-5 sm:h-5 px-1 bg-gold text-charcoal text-[10px] sm:text-xs rounded-full flex items-center justify-center font-semibold">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile Menu */}
              <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <button className="p-1.5 sm:p-2">
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="bg-charcoal border-white/10 w-[85vw] sm:w-80 overflow-y-auto"
                >
                  <div className="flex flex-col gap-6 mt-8">
                    <button
                      type="button"
                      onClick={() =>
                        handleSectionNavigation("collections", true)
                      }
                      className="text-lg hover:text-gold transition-colors text-left"
                    >
                      Collections
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSectionNavigation("featured", true)}
                      className="text-lg hover:text-gold transition-colors text-left"
                    >
                      Featured
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSectionNavigation("categories", true)}
                      className="text-lg hover:text-gold transition-colors text-left"
                    >
                      Categories
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSectionNavigation("products", true)}
                      className="text-lg hover:text-gold transition-colors text-left"
                    >
                      Shop
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSectionNavigation("trust", true)}
                      className="text-lg hover:text-gold transition-colors text-left"
                    >
                      About
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSectionNavigation("story", true)}
                      className="text-lg hover:text-gold transition-colors text-left"
                    >
                      Our Story
                    </button>
                    <Link
                      to="/cart"
                      onClick={() => setIsNavOpen(false)}
                      className="text-lg hover:text-gold transition-colors"
                    >
                      Cart ({totalItems})
                    </Link>
                    <hr className="border-white/10" />
                    <Button
                      onClick={() => {
                        setIsNavOpen(false);
                        setIsWhatsAppDialogOpen(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white w-full"
                    >
                      <WhatsAppIcon className="w-5 h-5 mr-2" />
                      Enquire on WhatsApp
                    </Button>
                    <Button
                      onClick={() => {
                        setIsNavOpen(false);
                        setIsAppointmentDialogOpen(true);
                      }}
                      variant="outline"
                      className="border-gold text-gold hover:bg-gold hover:text-charcoal w-full"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Appointment
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        ref={heroRef}
        className="relative h-screen w-full overflow-hidden"
      >
        <div className="absolute inset-0 hero-media">
          {shouldPlayHeroVideo && (
            <video
              ref={heroVideoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/hero-model.jpg"
              onCanPlay={() => setIsHeroVideoReady(true)}
              className={`hero-video object-cover w-full h-full transition-opacity duration-700 ${isHeroVideoReady ? "opacity-100" : "opacity-0"}`}
              aria-label="Gold and Diamond Jewellery Collections in Nellore"
            >
              <source src="/hero.mp4" type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 hero-video-vignette bg-black/30" />
          <div className="absolute inset-0 gradient-overlay bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative h-full flex items-center section-padding pt-20">
          <div className="max-w-2xl px-4 sm:px-0">
            {/* SEO Optimized H1 Header combining Brand and Location */}
            <h1 className="hero-title font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-tight text-white mb-4 sm:mb-6">
              Shanti{" "}
              <span className="text-gold block sm:inline">
                JEWELLERY Nellore
              </span>
            </h1>
            <p className="hero-subtitle text-lg sm:text-xl md:text-2xl text-gray-300 mb-4 font-light">
              The Best Jewellery Shop in Nellore
            </p>
            <p className="hero-subtitle text-sm sm:text-base text-gray-400 mb-8 sm:mb-10 max-w-lg">
              Since 1960, we bring you the finest{" "}
              <strong>Gold Jewellery</strong> and{" "}
              <strong>Diamond Jewellery</strong> near VRC Centre. Discover our
              exclusive <strong>Bridal Gold Jewellery</strong>, lightweight
              designs, and BIS Hallmarked collections.
            </p>
            <div className="hero-cta flex flex-col sm:flex-row gap-4">
              <a
                href="#products"
                className="btn-primary-luxury w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                Explore Collection
                <ArrowRight className="w-5 h-5" />
              </a>
              <button
                onClick={() => setIsWhatsAppDialogOpen(true)}
                className="btn-luxury w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Enquire Now
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Collection Section */}
      <section
        id="collections"
        ref={collectionRef}
        className="py-16 md:py-24 section-padding"
      >
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          <div className="w-full lg:w-1/3 lg:sticky lg:top-28">
            <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-4 block">
              Wedding & Everyday Collections
            </span>
            <h2 className="collection-title font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-4 md:mb-6">
              Exclusive Collections
            </h2>
            <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8 leading-relaxed">
              Step into a world of refined luxury. Explore our handpicked{" "}
              <strong>Gold Chains in Nellore</strong>, signature bridal sets,
              delicate pendants, and statement <strong>Gold Bangles</strong>{" "}
              designed to captivate.
            </p>
            <Link
              to="/collections"
              className="btn-luxury inline-flex items-center justify-center w-full sm:w-auto gap-2"
            >
              View Lookbook
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div
            className={`w-full lg:w-2/3 ${shouldScrollCollections ? "overflow-x-auto overscroll-x-contain scrollbar-hide pb-4" : ""}`}
          >
            <div
              className={
                shouldScrollCollections
                  ? "flex gap-4 sm:gap-6 min-w-max pr-4 lg:pr-1"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              }
            >
              {orderedCollections.map((collection) => (
                <Link
                  key={`${collection.slug}-${collection.id}`}
                  to={`/collections/${collection.slug}`}
                  className={`collection-card group relative overflow-hidden cursor-pointer block ${shouldScrollCollections ? "w-[240px] sm:w-[260px] md:w-[280px] shrink-0" : ""}`}
                  onMouseEnter={() => setHoveredCollection(collection.slug)}
                  onMouseLeave={() => setHoveredCollection(null)}
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-charcoal-dark">
                    <img
                      src={collection.image}
                      alt={`${collection.name} - Shanti JEWELLERY Nellore`}
                      loading="lazy"
                      className={`w-full h-full object-cover transform-gpu will-change-opacity transition-all duration-1000 ease-in-out group-hover:scale-110 ${(collection.slug === "bridal-collection" &&
                        shouldPlayHeroVideo &&
                        !hasBridalVideoError &&
                        isBridalVideoReady &&
                        hoveredCollection === "bridal-collection") ||
                        (collection.slug === "gold-classics" &&
                          shouldPlayHeroVideo &&
                          !hasGoldClassicsVideoError &&
                          isGoldClassicsVideoReady &&
                          hoveredCollection === "gold-classics") ||
                        (collection.slug === "diamond-essentials" &&
                          shouldPlayHeroVideo &&
                          !hasEssentialsVideoError &&
                          isEssentialsVideoReady &&
                          hoveredCollection === "diamond-essentials")
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100"
                        } ${(collection.slug === "bridal-collection" &&
                          shouldPlayHeroVideo &&
                          !hasBridalVideoError &&
                          !isBridalVideoReady &&
                          hoveredCollection === "bridal-collection") ||
                          (collection.slug === "gold-classics" &&
                            shouldPlayHeroVideo &&
                            !hasGoldClassicsVideoError &&
                            !isGoldClassicsVideoReady &&
                            hoveredCollection === "gold-classics") ||
                          (collection.slug === "diamond-essentials" &&
                            shouldPlayHeroVideo &&
                            !hasEssentialsVideoError &&
                            !isEssentialsVideoReady &&
                            hoveredCollection === "diamond-essentials")
                          ? "animate-pulse"
                          : ""
                        }`}
                    />

                    {collection.slug === "bridal-collection" &&
                      shouldPlayHeroVideo &&
                      !hasBridalVideoError &&
                      hoveredCollection === "bridal-collection" && (
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="metadata"
                          poster={collection.image}
                          onCanPlay={() => setIsBridalVideoReady(true)}
                          onError={() => {
                            setHasBridalVideoError(true);
                            setIsBridalVideoReady(false);
                          }}
                          className={`absolute inset-0 w-full h-full object-cover transform-gpu will-change-opacity transition-all duration-1000 ease-in-out group-hover:scale-110 pointer-events-none ${isBridalVideoReady ? "opacity-100" : "opacity-0"
                            }`}
                          aria-label="Bridal collection video preview"
                        >
                          <source src="/bridalvideo.mp4" type="video/mp4" />
                        </video>
                      )}

                    {collection.slug === "gold-classics" &&
                      shouldPlayHeroVideo &&
                      !hasGoldClassicsVideoError &&
                      hoveredCollection === "gold-classics" && (
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="metadata"
                          poster={collection.image}
                          onCanPlay={() => setIsGoldClassicsVideoReady(true)}
                          onError={() => {
                            setHasGoldClassicsVideoError(true);
                            setIsGoldClassicsVideoReady(false);
                          }}
                          className={`absolute inset-0 w-full h-full object-cover transform-gpu will-change-opacity transition-all duration-1000 ease-in-out group-hover:scale-110 pointer-events-none ${isGoldClassicsVideoReady
                            ? "opacity-100"
                            : "opacity-0"
                            }`}
                          aria-label="Gold Classics collection video preview"
                        >
                          <source src="/clasicalvideo.mp4" type="video/mp4" />
                        </video>
                      )}

                    {collection.slug === "diamond-essentials" &&
                      shouldPlayHeroVideo &&
                      !hasEssentialsVideoError &&
                      hoveredCollection === "diamond-essentials" && (
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="metadata"
                          poster={collection.image}
                          onCanPlay={() => setIsEssentialsVideoReady(true)}
                          onError={() => {
                            setHasEssentialsVideoError(true);
                            setIsEssentialsVideoReady(false);
                          }}
                          className={`absolute inset-0 w-full h-full object-cover transform-gpu will-change-opacity transition-all duration-1000 ease-in-out group-hover:scale-110 pointer-events-none ${isEssentialsVideoReady ? "opacity-100" : "opacity-0"
                            }`}
                          aria-label="Diamond Essentials collection video preview"
                        >
                          <source src="/diamondvideo.mp4" type="video/mp4" />
                        </video>
                      )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <span className="text-gold text-[10px] sm:text-xs tracking-widest uppercase mb-1 sm:mb-2 block">
                      {collection.subtitle || "Signature Edit"}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl text-white">
                      {collection.name}
                    </h3>
                  </div>
                </Link>
              ))}

              {orderedCollections.length === 0 && (
                <div
                  className={`${shouldScrollCollections ? "w-[280px] shrink-0" : "md:col-span-3"} border border-white/10 bg-charcoal-light p-6 text-gray-300 text-sm`}
                >
                  Collections are not available right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section
        id="featured"
        ref={featuredRef}
        className="py-16 md:py-24 section-padding bg-charcoal-light"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
          <div className="featured-content order-2 lg:order-1">
            <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-3 md:mb-4 block">
              Featured 18K & 22K Ornaments
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-4 md:mb-6">
              Handpicked Excellence
            </h2>
            <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8 leading-relaxed">
              Every piece in our featured collection represents the pinnacle of
              craftsmanship at our{" "}
              <strong>Jewellery Shop Near SBI Barkas Center</strong>. From
              intricate antique goldwork to brilliant diamond settings, these
              pieces define our dedication to purity and style.
            </p>
            <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
              <div className="border border-white/10 p-4 sm:p-6 text-center">
                <span className="font-serif text-2xl sm:text-3xl text-gold block mb-1 sm:mb-2">
                  18K/22K
                </span>
                <h3 className="text-gray-400 text-xs sm:text-sm">
                  Pure Gold Jewellery
                </h3>
              </div>
              <div className="border border-white/10 p-4 sm:p-6 text-center">
                <span className="font-serif text-2xl sm:text-3xl text-gold block mb-1 sm:mb-2">
                  IGI
                </span>
                <h3 className="text-gray-400 text-xs sm:text-sm">
                  Certified Diamonds
                </h3>
              </div>
            </div>
            <a
              href="#products"
              className="btn-luxury w-full sm:w-auto inline-flex justify-center items-center gap-2"
            >
              Shop Featured
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <div className="order-1 lg:order-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="image-hover-zoom">
              <img
                src="/featured-main.jpg"
                alt="18K Gold Bridal Jewellery Nellore"
                loading="lazy"
                className="w-full h-[250px] sm:h-[300px] md:h-[400px] object-cover"
              />
            </div>
            <div className="image-hover-zoom sm:mt-12 hidden sm:block">
              <img
                src="/featured-detail.jpg"
                alt="Diamond Jewellery Details - Best Shop in Nellore"
                loading="lazy"
                className="w-full h-[300px] md:h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - ADDED BACK IN! */}
      <section
        id="categories"
        ref={categoryRef}
        className="py-16 md:py-24 section-padding"
      >
        <div className="text-center mb-10 md:mb-16">
          <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-3 block">
            Discover Our Offerings
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white">
            Shop by Category
          </h2>
        </div>

        <div
          className={
            shouldScrollCategories
              ? "max-w-full overflow-x-auto overscroll-x-contain scrollbar-hide pb-4"
              : ""
          }
        >
          <div
            className={
              shouldScrollCategories
                ? "flex min-w-max gap-4 sm:gap-6 pr-4 lg:pr-1"
                : "grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            }
          >
            {isCategoriesLoading ? (
              <div className="w-full col-span-4 text-gray-400 text-center py-8">
                Loading categories...
              </div>
            ) : landingCategories.length > 0 ? (
              landingCategories.map((category) => (
                <div
                  key={`${category.slug}-${category.id}`}
                  className={`category-card group cursor-pointer ${shouldScrollCategories ? "w-[200px] sm:w-[240px] md:w-[280px] shrink-0" : ""}`}
                >
                  <div className="relative overflow-hidden mb-3 md:mb-4">
                    <div className="aspect-square bg-charcoal-dark border border-white/10 rounded-sm">
                      <img
                        src={category.image}
                        alt={`${category.name} Collections - Nellore Gold Shop`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Link
                        to={`/category/${category.slug}`}
                        className="btn-luxury text-xs sm:text-sm"
                      >
                        Explore {category.name}
                      </Link>
                    </div>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-white text-center">
                    {category.name}
                  </h3>
                </div>
              ))
            ) : (
              <div
                className={`${shouldScrollCategories ? "w-[260px] shrink-0" : "col-span-2 lg:col-span-4"} border border-white/10 bg-charcoal-light p-6 text-center text-gray-300 text-sm`}
              >
                Categories are not available right now.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Section (Continuous Carousel) */}
      <section
        id="products"
        ref={productsRef}
        className="py-16 md:py-24 section-padding bg-charcoal-light overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12">
          <div>
            <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-2 md:mb-4 block">
              Our Exquisite Range
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white">
              Types of Jewellery Available
            </h2>
            <p className="text-sm md:text-base text-gray-400 mt-3 max-w-2xl leading-relaxed">
              Explore our diverse collections of handcrafted gold, diamond, and bridal ornaments. Tap to explore our designs.
            </p>
          </div>
        </div>

        {/* CSS for Continuous Infinite Marquee */}
        <style>
          {`
            @keyframes marquee-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee-infinite {
              display: flex;
              width: max-content;
              animation: marquee-scroll 45s linear infinite;
            }
            .animate-marquee-infinite:hover {
              animation-play-state: paused;
            }
          `}
        </style>

        <div className="relative w-full pb-4">
          {/* Optional: Add gradient edges to make the text fade out smoothly at the sides */}

          {/* Marquee Track */}
          <div className="animate-marquee-infinite">
            {/* First Set of Items */}
            <div className="flex gap-4 sm:gap-6 pr-4 sm:pr-6">
              {jewelleryTypes.map((type) => (
                <article
                  key={type.id}
                  className="product-card card-luxury group w-[240px] sm:w-[280px] md:w-[300px] shrink-0 border border-white/10 hover:border-gold/30 transition-colors bg-charcoal"
                >
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={type.image}
                      alt={`${type.name} - Jewellery in Nellore`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                  </div>
                  <div className="p-4 sm:p-5 md:p-6 text-center">
                    <h3 className="font-serif text-lg sm:text-xl text-gold mb-2">
                      {type.name}
                    </h3>
                    <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Second Set of Items (Duplicate for seamless looping) */}
            <div className="flex gap-4 sm:gap-6 pr-4 sm:pr-6" aria-hidden="true">
              {jewelleryTypes.map((type) => (
                <article
                  key={`dup-${type.id}`}
                  className="product-card card-luxury group w-[240px] sm:w-[280px] md:w-[300px] shrink-0 border border-white/10 hover:border-gold/30 transition-colors bg-charcoal"
                >
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={type.image}
                      alt={`${type.name} - Jewellery in Nellore`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                  </div>
                  <div className="p-4 sm:p-5 md:p-6 text-center">
                    <h3 className="font-serif text-lg sm:text-xl text-gold mb-2">
                      {type.name}
                    </h3>
                    <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section
        id="trust"
        ref={trustRef}
        className="py-16 md:py-24 section-padding"
      >
        <div className="text-center mb-10 md:mb-16">
          <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-3 block">
            Why Choose Us
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white">
            Our Promise
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="trust-item text-center p-6 md:p-8 border border-white/10 hover:border-gold/50 transition-colors">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 flex items-center justify-center border border-gold/50 rounded-full">
              <Award className="w-6 h-6 md:w-8 md:h-8 text-gold" />
            </div>
            <h3 className="font-serif text-lg md:text-xl text-white mb-2 md:mb-3">
              Certified Quality
            </h3>
            <p className="text-gray-400 text-xs md:text-sm">
              Authentic <strong>BIS Hallmarked Gold Jewellery</strong> and IGI
              certified diamonds with 100% guarantee.
            </p>
          </div>

          <div className="trust-item text-center p-6 md:p-8 border border-white/10 hover:border-gold/50 transition-colors">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 flex items-center justify-center border border-gold/50 rounded-full">
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-gold" />
            </div>
            <h3 className="font-serif text-lg md:text-xl text-white mb-2 md:mb-3">
              Trusted Since 1960
            </h3>
            <p className="text-gray-400 text-xs md:text-sm">
              We are the most <strong>Trusted Jewellery Store</strong> located
              near VRC Centre, Nellore.
            </p>
          </div>

          <div className="trust-item text-center p-6 md:p-8 border border-white/10 hover:border-gold/50 transition-colors">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 flex items-center justify-center border border-gold/50 rounded-full">
              <Gem className="w-6 h-6 md:w-8 md:h-8 text-gold" />
            </div>
            <h3 className="font-serif text-lg md:text-xl text-white mb-2 md:mb-3">
              Expert Craftsmanship
            </h3>
            <p className="text-gray-400 text-xs md:text-sm">
              Discover intricate <strong>Antique Jewellery Nellore</strong>{" "}
              crafted by our master artisans.
            </p>
          </div>

          <div className="trust-item text-center p-6 md:p-8 border border-white/10 hover:border-gold/50 transition-colors">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 flex items-center justify-center border border-gold/50 rounded-full">
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-gold" />
            </div>
            <h3 className="font-serif text-lg md:text-xl text-white mb-2 md:mb-3">
              Custom Designs
            </h3>
            <p className="text-gray-400 text-xs md:text-sm">
              Bespoke wedding and bridal design services to bring your dream
              jewellery to life.
            </p>
          </div>
        </div>

        {/* NEW: Certifications Logo Banner */}
        <div className="mt-16 md:mt-20 pt-10 md:pt-12 border-t border-white/10 text-center">
          <span className="text-gold text-xs sm:text-sm  md:text-lg tracking-widest uppercase mb-8 block">
            Certified & Recognized By
          </span>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-10">
            <img
              src="/bis.png"
              alt="BIS Hallmark Certified Jewellery Nellore"
              loading="lazy"
              className="h-32 md:h-36 lg:h-52 w-auto object-contain hover:scale-110 transition-transform duration-500"
            />
            <img
              src="/igi.png"
              alt="IGI Certified Diamonds Nellore"
              loading="lazy"
              className="h-32 md:h-36 lg:h-52 w-auto object-contain hover:scale-110 transition-transform duration-500"
            />
            <img
              src="/gia3.jpg"
              alt="GIA Certified Diamonds Nellore"
              loading="lazy"
              className="h-32 md:h-36 lg:h-52 w-auto object-contain hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* Secure Delivery Partner Section */}
      <section className="py-12 md:py-16 border-t border-b border-white/10 bg-charcoal/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-4 block">
            100% Insured & Safe Shipping
          </span>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-white mb-4 md:mb-6">
            Our Secure Delivery Partner
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed">
            We deliver your precious jewellery safely and securely anywhere in
            Andhra Pradesh. Every single shipment is fully insured, highly
            guarded, and tracked straight to your doorstep.
          </p>

          <div className="flex flex-col mx-auto text-center align-middle items-center">
            <img
              src="/sequel.png"
              alt="Sequel Logistics - Secure Jewellery Delivery Partner Andhra Pradesh"
              loading="lazy"
              className="w-48 md:w-64 lg:w-80 h-auto object-contain hover:scale-105 transition-transform duration-500 mb-4"
            />
            <p className="text-gray-500 text-xs md:text-sm tracking-wide">
              Trusted Logistics for Precious Commodities
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section
        id="story"
        ref={storyRef}
        className="py-16 md:py-24 section-padding bg-charcoal border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12 story-content">
            <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-3 block">
              Legacy & Heritage of
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white">
              SHANTI JEWELLERY
            </h2>
          </div>

          <div className="relative w-full aspect-video mb-10 md:mb-16">
            <iframe
              className="w-full h-full shadow-2xl rounded-sm"
              src="https://www.youtube.com/embed/M3qSUH2_soo?autoplay=1&mute=1&loop=1&playlist=M3qSUH2_soo"
              title="Shanti JEWELLERY Nellore Our Story"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 0 }}
            ></iframe>
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 text-gray-300 text-base md:text-lg leading-relaxed px-4">
            <p>
              <span className="text-white font-serif tracking-wider text-lg md:text-xl">
                SHANTI JEWELLERY
              </span>{" "}
              was established in the year 1960. Our grandfather Late Sri{" "}
              <span className="text-gold font-medium">JETMAL JAIN</span> Garu
              established this shop. He is affectionately known as RAMANAIYA
              GARU.
            </p>
            <p>
              This is our third generation in the jewellery business. Each and
              every ornament carries the{" "}
              <strong className="text-white font-medium">
                BIS 916 HALLMARK
              </strong>
              . All our diamond jewellery is{" "}
              <strong className="text-white font-medium">IGI CERTIFIED</strong>.
              We never compromise on quality, and customisation is one of our
              specialties.
            </p>
            <p>
              We provide premium GOLD & DIAMOND jewellery with the finest
              craftsmanship and finely assorted, superior-quality stones. If you
              are looking for the{" "}
              <strong>Best Jewellery Shop in Nellore</strong>, our handpicked
              pieces offer unmatched elegance.
            </p>

            <div className="pt-6">
              <Button
                onClick={() => setIsWhatsAppDialogOpen(true)}
                className="bg-transparent border border-gold text-gold hover:bg-gold hover:text-charcoal px-6 py-4 md:px-10 md:py-6 text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 w-full sm:w-auto"
              >
                Contact Us For Details
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FULL SEO, REVIEWS, LIVE RATES, SOCIAL, AND FAQ SECTION */}
      <section
        ref={seoSectionRef}
        className="py-16 md:py-24 section-padding bg-charcoal-dark border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-300">

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 seo-content-block">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">
                Nellore's Finest Jewellery Collections
              </h2>
              <div className="w-16 h-[2px] bg-gold mx-auto mb-6"></div>
            </div>

            <div className="space-y-12 seo-content-block">
              {/* SEO Article Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-serif text-white mb-3 text-gold">
                    Bridal Jewellery in Nellore
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed">
                    Your wedding day deserves perfection. As the leading
                    destination for{" "}
                    <strong>Wedding Jewellery in Nellore</strong>, we craft
                    exquisite bridal sets that blend traditional South Indian
                    aesthetics with modern elegance. From heavy temple-inspired
                    necklaces to delicate maang tikkas, our bridal trousseau
                    makes every bride shine.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-serif text-white mb-3 text-gold">
                    Exclusive Gold & Diamond Range
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed">
                    Explore our vast collection ranging from{" "}
                    <strong>Lightweight Gold Jewellery</strong> perfect for
                    daily wear, to spectacular statement pieces. Whether you're
                    searching for authentic{" "}
                    <strong>Gold Chains in Nellore</strong> or a brilliantly cut{" "}
                    <strong>Diamond Jewellery Store in Nellore</strong>, Shanti
                    Jewellery offers unmatched purity and value.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* Google Reviews Horizontal Carousel         */}
          {/* ========================================== */}
          <div className="max-w-7xl mx-auto my-16 pt-10">
            <div className="flex flex-col items-center text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-serif text-white mb-2 text-center">
                Loved by Generations in Nellore
              </h3>

              <div className="flex items-center justify-center gap-3">
                <span className="text-xl md:text-2xl font-semibold text-white">
                  4.8
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={`header-star-${star}`} />
                  ))}
                </div>
                <span className="text-gray-400 text-sm">
                  (330+ Google Reviews)
                </span>
              </div>

              <a
                href="https://www.google.com/search?q=shanti+jewellers+nellore"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-gold hover:text-white transition-colors text-sm flex items-center gap-2"
              >
                Write a review <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div
              ref={reviewCarouselRef}
              onMouseEnter={() => setIsCarouselHovered(true)}
              onMouseLeave={() => setIsCarouselHovered(false)}
              onTouchStart={() => setIsCarouselHovered(true)}
              onTouchEnd={() => setIsCarouselHovered(false)}
              className="flex overflow-x-auto overscroll-x-contain scrollbar-hide snap-x snap-mandatory gap-4 md:gap-6 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
            >
              {googleReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-charcoal border border-white/10 p-6 md:p-8 rounded-sm snap-center flex flex-col justify-between w-[320px] sm:w-[380px] md:w-[420px] shrink-0 hover:border-gold/30 transition-colors text-left"
                >
                  <div className="flex flex-col h-full w-full">
                    <div className="flex justify-between items-start mb-5 w-full">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold/20 text-gold flex items-center justify-center font-serif text-lg md:text-xl font-bold shrink-0">
                          {review.name.charAt(0)}
                        </div>
                        <div className="flex flex-col items-start overflow-hidden">
                          <h4 className="text-white font-medium text-sm md:text-base leading-snug truncate max-w-full">
                            {review.name}
                          </h4>
                          <span className="text-gray-500 text-xs md:text-sm mt-0.5">
                            {review.time}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 pt-1 pl-2">
                        <GoogleIcon />
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={`star-${review.id}-${star}`} />
                      ))}
                    </div>
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed italic whitespace-normal break-words">
                      "{review.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================== */}
          {/* Social Media Section & Follower Counts     */}
          {/* ========================================== */}
          <div className="max-w-7xl mx-auto my-16 pt-10 border-t border-white/10">
            <div className="flex flex-col items-center text-center gap-6">
              <div>
                <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-2 block">
                  Join Our Growing Community
                </span>
                <h3 className="text-2xl md:text-3xl font-serif text-white mb-2">
                  Our Digital Family
                </h3>
                <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto">
                  See why thousands follow us for the latest bridal and antique
                  designs.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                <a
                  href="https://www.instagram.com/shanti_jewellery1960/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-pink-500/50 px-4 py-2.5 rounded-sm transition-colors group"
                >
                  <InstagramIcon />
                  <div className="text-left">
                    <div className="text-white font-bold text-sm md:text-base group-hover:text-pink-500 transition-colors">
                      79K+ followers
                    </div>
                    <div className="text-gray-500 text-xs">
                      shanti_jewellery1960
                    </div>
                  </div>
                </a>
                <a
                  href="https://www.facebook.com/shantijewellery01/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-blue-500/50 px-4 py-2.5 rounded-sm transition-colors group"
                >
                  <FacebookIcon />
                  <div className="text-left">
                    <div className="text-white font-bold text-sm md:text-base group-hover:text-blue-500 transition-colors font-sans">
                      48K+ followers
                    </div>
                    <div className="text-gray-500 text-xs">
                      SHANTI JEWELLERY
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* FAQ Section                                */}
          {/* ========================================== */}
          <div className="max-w-4xl mx-auto mt-16 border-t border-white/10 pt-16">
            <h3 className="text-2xl font-serif text-white mb-6 text-center">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <details className="group border border-white/10 bg-charcoal p-4 cursor-pointer">
                <summary className="flex justify-between items-center font-medium text-white">
                  What is the best jewellery shop in Nellore?
                  <span className="transition group-open:rotate-180 text-gold">
                    <ChevronDown size={20} />
                  </span>
                </summary>
                <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                  SHANTI JEWELLERY is widely recognized as the best jewellery
                  shop in Nellore, serving customers since 1960 with premium
                  gold, diamond, and bridal collections.
                </p>
              </details>
              <details className="group border border-white/10 bg-charcoal p-4 cursor-pointer">
                <summary className="flex justify-between items-center font-medium text-white">
                  Does SHANTI JEWELLERY provide BIS Hallmarked jewellery?
                  <span className="transition group-open:rotate-180 text-gold">
                    <ChevronDown size={20} />
                  </span>
                </summary>
                <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                  Yes, every gold ornament at SHANTI JEWELLERY carries the
                  authentic BIS 916 Hallmark guarantee ensuring absolute purity.
                </p>
              </details>
              <details className="group border border-white/10 bg-charcoal p-4 cursor-pointer">
                <summary className="flex justify-between items-center font-medium text-white">
                  Where is SHANTI JEWELLERY located in Nellore?
                  <span className="transition group-open:rotate-180 text-gold">
                    <ChevronDown size={20} />
                  </span>
                </summary>
                <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                  We are centrally located at 2-148, Barkas Center, 17, Achari
                  St, Beside SBI, VRC Centre, Nellore, Andhra Pradesh 524001.
                </p>
              </details>
              <details className="group border border-white/10 bg-charcoal p-4 cursor-pointer">
                <summary className="flex justify-between items-center font-medium text-white">
                  Does SHANTI JEWELLERY offer bridal jewellery?
                  <span className="transition group-open:rotate-180 text-gold">
                    <ChevronDown size={20} />
                  </span>
                </summary>
                <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                  Yes, we specialize in exclusive Bridal Jewellery in Nellore,
                  offering custom wedding jewellery collections, gold necklaces,
                  bangles, and temple jewellery.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 section-padding bg-gold/5">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-4 md:mb-6">
            Ready to Find Your Perfect Piece?
          </h2>
          <p className="text-gray-300 mb-8 md:mb-10 max-w-2xl mx-auto text-sm md:text-base">
            Our jewelry experts at the VRC Centre store are here to help you
            discover the perfect piece. Book an appointment for a personalized
            consultation or reach out to us on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => setIsWhatsAppDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-5 md:px-8 md:py-6 text-base md:text-lg w-full sm:w-auto"
            >
              <WhatsAppIcon className="w-5 h-5 mr-2" />
              Enquire on WhatsApp
            </Button>
            <Button
              onClick={() => setIsAppointmentDialogOpen(true)}
              variant="outline"
              className="border-gold text-gold hover:bg-gold hover:text-charcoal px-6 py-5 md:px-8 md:py-6 text-base md:text-lg w-full sm:w-auto"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>
      </section>

      {/* Visit Us / Map Section */}
      <section
        id="visit"
        ref={mapSectionRef}
        className="py-16 md:py-24 section-padding bg-charcoal relative border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-3 block">
              Our Location in Nellore
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-4 md:mb-6">
              Visit Shanti JEWELLERY
            </h2>
            <div className="w-12 h-[2px] md:w-16 bg-gold mx-auto mb-4 md:mb-6"></div>
            <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto">
              We invite you to our flagship store near SBI Barkas Center to
              explore our exclusive collections.
            </p>
          </div>

          {/* Info Cards Grid */}
          <div className="map-floating-card grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
            {/* Address Card */}
            <address className="bg-charcoal-dark not-italic border border-white/10 p-6 md:p-8 text-center hover:border-gold/50 transition-colors duration-500 group flex flex-col items-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-charcoal border border-gold/30 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-gold" />
              </div>
              <h3 className="text-white font-serif text-lg md:text-xl mb-3">
                Address
              </h3>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 flex-grow">
                2-148, Barkas Center,
                <br />
                17, Achari St, beside SBI,
                <br />
                VRC Centre, Nellore, AP 524001
              </p>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=17/440,+Achari+St,+beside+SBI,+Barkas+Center,+VRC+Centre,+Nellore,+Andhra+Pradesh+524001"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold text-xs md:text-sm font-semibold tracking-widest uppercase hover:text-white transition-colors"
              >
                Get Directions <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </a>
            </address>

            {/* Contact Card */}
            <div className="bg-charcoal-dark border border-white/10 p-6 md:p-8 text-center hover:border-gold/50 transition-colors duration-500 group flex flex-col items-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-charcoal border border-gold/30 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
                <Phone className="w-5 h-5 md:w-6 md:h-6 text-gold" />
              </div>
              <h3 className="text-white font-serif text-lg md:text-xl mb-3">
                Contact
              </h3>
              <div className="flex-grow flex flex-col justify-center space-y-1 md:space-y-2">
                <a
                  href="tel:09039039056"
                  className="text-gray-400 hover:text-gold transition-colors text-base md:text-lg"
                >
                  +91 90390 39056
                </a>
                <a
                  href="tel:09039039057"
                  className="text-gray-400 hover:text-gold transition-colors text-base md:text-lg"
                >
                  +91 90390 39057
                </a>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-charcoal-dark border border-white/10 p-6 md:p-8 text-center hover:border-gold/50 transition-colors duration-500 group flex flex-col items-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-charcoal border border-gold/30 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-gold" />
              </div>
              <h3 className="text-white font-serif text-lg md:text-xl mb-3">
                Store Hours
              </h3>
              <div className="flex-grow flex flex-col justify-center">
                <p className="text-gray-400 text-xs md:text-sm mb-1 md:mb-2">
                  Monday - Saturday
                </p>
                <p className="text-white font-medium mb-3 md:mb-4 text-sm md:text-base">
                  10:00 AM - 8:30 PM
                </p>
                <p className="text-gold/80 text-[10px] md:text-xs tracking-widest uppercase">
                  Sunday Closed
                </p>
              </div>
            </div>
          </div>

          {/* Panoramic Map */}
          <div className="map-floating-card w-full relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 via-gold/5 to-gold/20 blur-sm"></div>
            <div className="relative w-full h-[300px] md:h-[450px] bg-charcoal-light border border-white/20 p-2">
              <iframe
                title="Shanti JEWELLERY Nellore Google Maps Location"
                src="https://www.google.com/maps?q=Shanti+JEWELLERY,+17/440,+Achari+St,+Nellore,+Andhra+Pradesh+524001&output=embed"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 section-padding bg-charcoal-dark border-t border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-10 md:mb-12">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-4">
              <img
                src="/shantilogo.png"
                alt="Shanti JEWELLERY Logo Nellore"
                loading="lazy"
                className="w-10 h-10 md:w-12 md:h-12 lg:w-[60px] lg:h-14 object-contain"
              />
              <span className="font-serif text-lg md:text-xl tracking-wider uppercase">
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
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:text-gold transition-colors"
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
                  href="#collections"
                  className="text-gray-400 hover:text-gold transition-colors text-xs md:text-sm"
                >
                  Collections
                </a>
              </li>
              <li>
                <a
                  href="#featured"
                  className="text-gray-400 hover:text-gold transition-colors text-xs md:text-sm"
                >
                  Featured
                </a>
              </li>
              <li>
                <a
                  href="#products"
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

        <div className="pt-6 md:pt-8 border-t  border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
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

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="bg-charcoal border-white/10 max-w-md md:max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4 md:gap-6">
              <div className="aspect-square">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div className="py-2">
                <span className="text-gold text-xs sm:text-sm tracking-widest uppercase">
                  {selectedProduct.category}
                </span>
                <DialogHeader className="text-left">
                  <DialogTitle className="font-serif text-2xl md:text-3xl text-white mt-1 md:mt-2">
                    {selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-gold text-xl md:text-2xl font-medium mt-3 md:mt-4">
                  {formatPrice(selectedProduct.price)}
                </p>
                <DialogDescription className="text-gray-400 mt-3 md:mt-4 text-xs md:text-sm">
                  Exquisite craftsmanship meets timeless design. This stunning
                  piece is meticulously crafted using the finest materials and
                  expert techniques passed down through generations in Nellore.
                </DialogDescription>
                <div className="mt-5 md:mt-6 space-y-4">
                  <div className="flex gap-3 md:gap-4">
                    <div className="flex-1 border border-white/10 p-2 md:p-3 text-center rounded-sm">
                      <span className="text-gray-400 text-[10px] md:text-xs block">
                        Purity
                      </span>
                      <span className="text-white text-sm md:text-base">
                        18K Gold
                      </span>
                    </div>
                    <div className="flex-1 border border-white/10 p-2 md:p-3 text-center rounded-sm">
                      <span className="text-gray-400 text-[10px] md:text-xs block">
                        Weight
                      </span>
                      <span className="text-white text-sm md:text-base">
                        12.5g
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
                  <Button
                    onClick={() => setIsWhatsAppDialogOpen(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white w-full"
                  >
                    <WhatsAppIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Enquire
                  </Button>
                  <Button
                    onClick={() => setIsAppointmentDialogOpen(true)}
                    variant="outline"
                    className="flex-1 border-gold text-gold hover:bg-gold hover:text-charcoal w-full"
                  >
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Book View
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* WhatsApp Dialog */}
      <Dialog
        open={isWhatsAppDialogOpen}
        onOpenChange={setIsWhatsAppDialogOpen}
      >
        <DialogContent className="bg-charcoal border-white/10 max-w-[90vw] md:max-w-md mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl md:text-2xl text-white text-center">
              Enquire on WhatsApp
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4 md:py-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <WhatsAppIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <p className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base px-2">
              Connect with us directly on WhatsApp for instant assistance and
              personalized recommendations.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  void openWhatsAppInquiry(
                    "Hi, I'm interested in your jewelry collection.",
                  );
                }}
                disabled={isOpeningWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 md:py-3 px-4 md:px-6 rounded flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
              >
                <WhatsAppIcon className="w-4 h-4 md:w-5 md:h-5" />
                {isOpeningWhatsApp ? "Opening..." : "Start Chat"}
              </button>
              <Button
                variant="outline"
                onClick={() => setIsWhatsAppDialogOpen(false)}
                className="w-full border-white/20 text-white hover:bg-white/10 text-sm md:text-base"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Dialog */}
      <Dialog
        open={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
      >
        <DialogContent className="bg-charcoal border-white/10 max-w-[90vw] md:max-w-md mx-auto rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl md:text-2xl text-white text-center">
              Book an Appointment
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 md:py-6">
            <p className="text-gray-300 text-center mb-4 md:mb-6 text-sm md:text-base">
              Schedule a personalized consultation with our jewelry experts at
              our Nellore branch.
            </p>
            <form className="space-y-3 md:space-y-4">
              <div>
                <label className="text-gray-400 text-xs md:text-sm block mb-1.5 md:mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full bg-charcoal-light border border-white/10 text-white px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:border-gold focus:outline-none rounded-sm"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs md:text-sm block mb-1.5 md:mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full bg-charcoal-light border border-white/10 text-white px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:border-gold focus:outline-none rounded-sm"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs md:text-sm block mb-1.5 md:mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  className="w-full bg-charcoal-light border border-white/10 text-white px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:border-gold focus:outline-none rounded-sm"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs md:text-sm block mb-1.5 md:mb-2">
                  Message (Optional)
                </label>
                <textarea
                  className="w-full bg-charcoal-light border border-white/10 text-white px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:border-gold focus:outline-none resize-none rounded-sm"
                  rows={3}
                  placeholder="What are you looking for?"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-light text-charcoal font-medium py-2.5 md:py-3 text-sm md:text-base mt-2"
              >
                <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Request Appointment
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating WhatsApp Button */}
      <button
        type="button"
        onClick={() => {
          void openWhatsAppInquiry(
            "Hi, I am interested in your jewelry collection.",
          );
        }}
        aria-label="Open WhatsApp"
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-40"
      >
        <WhatsAppIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </button>
    </div>
  );
}

export default App;