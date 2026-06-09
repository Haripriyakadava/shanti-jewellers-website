import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  ChevronDown
} from "lucide-react";
import { SeoHead } from "./components/SeoHead"; // <-- IMPORT ADDED HERE

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
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { categories as localCatalogCategories } from "@/data/catalog";
import { collections as localLandingCollections } from "@/data/collections";
import {
  getShopStorageEventName,
  getWishlistIds,
  toggleWishlistItem,
} from "@/lib/shop-storage";
import {
  fetchAllCategories,
  fetchAllCollections,
  fetchBestSellerProducts,
  fetchMetalPriceTicker,
  type ShopProductCard,
  type ShopCategory,
  type ShopCollection,
  type ShopMetalPriceTickerItem,
} from "@/lib/shop-api";

gsap.registerPlugin(ScrollTrigger);

const fallbackLandingCollections: ShopCollection[] =
  localLandingCollections.map((collection, index) => ({
    id: index + 1,
    name: collection.name,
    slug: collection.slug,
    subtitle: collection.subtitle,
    description: collection.description,
    image: collection.image,
  }));

const PRIORITY_COLLECTION_SLUGS = [
  "gold-classics",
  "bridal-collection",
  "diamond-essentials",
] as const;

type HomeCategory = {
  id: number;
  name: string;
  slug: string;
  image: string;
  count: number;
};

const fallbackHomeCategories: HomeCategory[] = localCatalogCategories.map(
  (category, index) => ({
    id: index + 1,
    name: category.name,
    slug: category.name.toLowerCase().trim().replace(/\s+/g, "-"),
    image: category.image,
    count: category.count,
  }),
);

const fallbackGoldPriceTicker: ShopMetalPriceTickerItem[] = [];

function mapShopCategoryToHomeCategory(category: ShopCategory): HomeCategory {
  const fallbackMatch = fallbackHomeCategories.find(
    (item) => item.slug === category.slug,
  );

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image || fallbackMatch?.image || "/cat-rings.jpg",
    count: category.productCount ?? 0,
  };
}

function App() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { totalItems, addToCart, cartItems } = useCart();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ShopProductCard | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>(() => getWishlistIds());
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
  const [landingCategories, setLandingCategories] = useState<HomeCategory[]>(
    fallbackHomeCategories,
  );
  const [bestSellerProducts, setBestSellerProducts] = useState<
    ShopProductCard[]
  >([]);
  const [isBestSellerLoading, setIsBestSellerLoading] = useState(true);
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

      // gsap.from(".story-image", {
      //   scrollTrigger: {
      //     trigger: storyRef.current,
      //     start: "top 75%",
      //   },
      //   opacity: 0,
      //   x: -50,
      //   duration: 1,
      //   ease: "power3.out",
      // });

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

  useEffect(() => {
    let isMounted = true;

    setIsBestSellerLoading(true);

    const loadHomeContent = async () => {
      const [
        collectionsResult,
        categoriesResult,
        bestSellerResult,
        goldPricesResult,
      ] = await Promise.allSettled([
        fetchAllCollections(),
        fetchAllCategories(),
        fetchBestSellerProducts(12),
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

      if (categoriesResult.status === "fulfilled") {
        setLandingCategories(
          categoriesResult.value.map((category) =>
            mapShopCategoryToHomeCategory(category),
          ),
        );
      } else {
        setLandingCategories(fallbackHomeCategories);
        toast.error(
          "Unable to load categories from Supabase. Showing local categories.",
        );
      }

      if (bestSellerResult.status === "fulfilled") {
        setBestSellerProducts(bestSellerResult.value);
      } else {
        setBestSellerProducts([]);
        toast.error("Unable to load best sellers from Supabase.");
      }

      if (
        goldPricesResult.status === "fulfilled" &&
        goldPricesResult.value.length > 0
      ) {
        setGoldPriceTicker(goldPricesResult.value);
      } else {
        setGoldPriceTicker(fallbackGoldPriceTicker);
      }

      setIsBestSellerLoading(false);
    };

    void loadHomeContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleWishlist = (id: number) => {
    const isAdding = !wishlist.includes(id);
    const updated = toggleWishlistItem(id);
    setWishlist(updated);

    if (isAdding) {
      const productName =
        bestSellerProducts.find((item) => item.id === id)?.name ?? "Product";
      toast.success(`${productName} added to wishlist.`);
    }
  };

  const addProductToCart = (product: ShopProductCard) => {
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice: product.price,
      quantity: 1,
      selection: {
        metal: product.metal,
        carat: 3,
        diamondType: product.metal === "Diamond" ? "Natural" : "Lab-Grown",
        size: "N/A",
      },
    });
    toast.success(`${product.name} added to cart.`);
  };

  const openProductDialog = (product: ShopProductCard) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

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
    }).format(price); // <--- Add .format(price) right here
  };

  const cartProductIds = useMemo(() => {
    return new Set(cartItems.map((item) => item.productId));
  }, [cartItems]);

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
    <div className="min-h-screen bg-charcoal text-white">
      {/* Dynamic SEO Meta & JSON-LD injection */}
      <SeoHead />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal/90 backdrop-blur-md border-b border-white/5">
        {hasGoldPriceTicker && (
          <div className="border-b border-gold/30 bg-charcoal-light/80 overflow-hidden">
            <div className="gold-price-ticker-track py-1.5">
              <div className="gold-price-ticker-content text-[11px] sm:text-xs tracking-[0.14em] uppercase text-gold/95 px-4">
                {goldPriceTickerItems.map((item, index) => (
                  <span
                    key={`ticker-primary-${index}`}
                    className="gold-price-ticker-item"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div
                className="gold-price-ticker-content text-[11px] sm:text-xs tracking-[0.14em] uppercase text-gold/95 px-4"
                aria-hidden="true"
              >
                {goldPriceTickerItems.map((item, index) => (
                  <span
                    key={`ticker-duplicate-${index}`}
                    className="gold-price-ticker-item"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
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
                alt="Shanthi Jewellers Nellore Official Logo"
                width="60"
                height="56"
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-[60px] md:h-14 object-contain"
              />
              <span className="font-serif text-lg sm:text-xl tracking-wider uppercase">
                SHANTI <span className="text-gold">JEWELLERS</span>
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
                      onClick={() => handleSectionNavigation("collections", true)}
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
              Shanthi <span className="text-gold block sm:inline">Jewellers Nellore</span>
            </h1>
            <p className="hero-subtitle text-lg sm:text-xl md:text-2xl text-gray-300 mb-4 font-light">
              The Best Jewellery Shop in Nellore
            </p>
            <p className="hero-subtitle text-sm sm:text-base text-gray-400 mb-8 sm:mb-10 max-w-lg">
              Since 1960, we bring you the finest <strong>Gold Jewellery</strong> and <strong>Diamond Jewellery</strong> near VRC Centre. Discover our exclusive <strong>Bridal Gold Jewellery</strong>, lightweight designs, and BIS Hallmarked collections.
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
              Step into a world of refined luxury. Explore our handpicked <strong>Gold Chains in Nellore</strong>, signature bridal sets, delicate pendants, and statement <strong>Gold Bangles</strong> designed to captivate.
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
                      alt={`${collection.name} - Shanti Jewellers Nellore`}
                      loading="lazy"
                      className={`w-full h-full object-cover transform-gpu will-change-opacity transition-all duration-1000 ease-in-out group-hover:scale-110 ${
                        (collection.slug === "bridal-collection" &&
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
                      } ${
                        (collection.slug === "bridal-collection" &&
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
                          className={`absolute inset-0 w-full h-full object-cover transform-gpu will-change-opacity transition-all duration-1000 ease-in-out group-hover:scale-110 pointer-events-none ${
                            isBridalVideoReady ? "opacity-100" : "opacity-0"
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
                          className={`absolute inset-0 w-full h-full object-cover transform-gpu will-change-opacity transition-all duration-1000 ease-in-out group-hover:scale-110 pointer-events-none ${
                            isGoldClassicsVideoReady
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
                          className={`absolute inset-0 w-full h-full object-cover transform-gpu will-change-opacity transition-all duration-1000 ease-in-out group-hover:scale-110 pointer-events-none ${
                            isEssentialsVideoReady ? "opacity-100" : "opacity-0"
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
              Every piece in our featured collection represents the pinnacle of craftsmanship at our <strong>Jewellery Shop Near SBI Barkas Center</strong>. From intricate antique goldwork to brilliant diamond settings, these pieces define our dedication to purity and style.
            </p>
            <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
              <div className="border border-white/10 p-4 sm:p-6 text-center">
                <span className="font-serif text-2xl sm:text-3xl text-gold block mb-1 sm:mb-2">
                  18K/22K
                </span>
                <h3 className="text-gray-400 text-xs sm:text-sm">Pure Gold Jewellery</h3>
              </div>
              <div className="border border-white/10 p-4 sm:p-6 text-center">
                <span className="font-serif text-2xl sm:text-3xl text-gold block mb-1 sm:mb-2">
                  IGI
                </span>
                <h3 className="text-gray-400 text-xs sm:text-sm">Certified Diamonds</h3>
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

      {/* Categories Section */}
      <section
        id="categories"
        ref={categoryRef}
        className="py-16 md:py-24 section-padding"
      >
        <div className="text-center mb-10 md:mb-16">
          <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-3 block">
            Discover Our Offerings
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white">Shop by Category</h2>
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
            {landingCategories.map((category) => (
              <div
                key={`${category.slug}-${category.id}`}
                className={`category-card group cursor-pointer ${shouldScrollCategories ? "w-[200px] sm:w-[240px] md:w-[280px] shrink-0" : ""}`}
              >
                <div className="relative overflow-hidden mb-3 md:mb-4">
                  <div className="aspect-square">
                    <img
                      src={category.image}
                      alt={`${category.name} Collections - Nellore Gold Shop`}
                      loading="lazy"
                      onError={(event) => {
                        const target = event.currentTarget;
                        if (target.dataset.fallbackApplied === "true") {
                          return;
                        }
                        target.dataset.fallbackApplied = "true";
                        target.src = fallbackHomeCategories.find(
                            (item) => item.slug === category.slug,
                          )?.image || "/cat-rings.jpg";
                      }}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
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
                <p className="text-gray-400 text-xs sm:text-sm text-center">
                  {category.count.toLocaleString()}{" "}
                  {category.count === 1 ? "Product" : "Products"}
                </p>
              </div>
            ))}

            {landingCategories.length === 0 && (
              <div
                className={`${shouldScrollCategories ? "w-[260px] shrink-0" : "col-span-2 lg:col-span-4"} border border-white/10 bg-charcoal-light p-6 text-center text-gray-300 text-sm`}
              >
                Categories are not available right now.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section
        id="products"
        ref={productsRef}
        className="py-16 md:py-24 section-padding bg-charcoal-light"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12">
          <div>
            <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-2 md:mb-4 block">
              Nellore Favorites
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white">Best Sellers</h2>
          </div>
          <Link
            to="/category/rings"
            className="text-gold hover:text-gold-light transition-colors flex items-center gap-2 mt-4 sm:mt-0 text-sm md:text-base font-medium"
          >
            View All Products
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>

        <div className="max-w-full overflow-x-auto overscroll-x-contain scrollbar-hide pb-4">
          <div className="flex min-w-max gap-4 sm:gap-6 pr-4 lg:pr-1">
            {isBestSellerLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`best-seller-skeleton-${index}`}
                  className="product-card card-luxury overflow-hidden border border-white/10 bg-black/20 w-[240px] sm:w-[280px] md:w-[300px] shrink-0"
                >
                  <div className="aspect-square animate-pulse bg-white/5" />
                  <div className="p-4 sm:p-6 space-y-3">
                    <div className="h-3 w-24 animate-pulse bg-white/10" />
                    <div className="h-5 w-3/4 animate-pulse bg-white/10" />
                    <div className="h-4 w-20 animate-pulse bg-white/10" />
                  </div>
                </div>
              ))
            ) : bestSellerProducts.length > 0 ? (
              bestSellerProducts.map((product) => (
                <article
                  key={product.id}
                  className="product-card card-luxury group w-[240px] sm:w-[280px] md:w-[300px] shrink-0"
                >
                  <div className="relative overflow-hidden">
                    <div className="aspect-square">
                      <img
                        src={product.image}
                        alt={`${product.name} - Buy Gold Jewellery in Nellore`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    {product.isNew && (
                      <Badge className="absolute top-3 left-3 md:top-4 md:left-4 bg-gold text-charcoal text-[10px] md:text-xs">
                        New
                      </Badge>
                    )}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-3 right-3 md:top-4 md:right-4 p-2 bg-charcoal/80 rounded-full md:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart
                        className={`w-4 h-4 md:w-5 md:h-5 ${wishlist.includes(product.id) ? "fill-gold text-gold" : "text-white"}`}
                      />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-charcoal to-transparent md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openProductDialog(product)}
                          className="w-full btn-primary-luxury text-[10px] md:text-xs lg:text-sm text-center px-1 py-2 md:px-2 md:py-3"
                        >
                          Quick View
                        </button>
                        <button
                          onClick={() => {
                            if (cartProductIds.has(product.id)) {
                              navigate("/cart");
                              return;
                            }
                            addProductToCart(product);
                          }}
                          className={`w-full border border-gold transition-colors text-[10px] md:text-xs lg:text-sm px-1 py-2 md:px-2 md:py-3 ${
                            cartProductIds.has(product.id)
                              ? "bg-gold text-charcoal hover:bg-gold-light"
                              : "text-gold hover:bg-gold hover:text-charcoal"
                          }`}
                        >
                          {cartProductIds.has(product.id)
                            ? "View Cart"
                            : "Add Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <span className="text-gray-400 text-[10px] sm:text-xs tracking-widest uppercase">
                      {product.category}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg text-white mt-1 mb-2 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gold font-medium text-sm sm:text-base">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="w-[240px] sm:w-[280px] md:w-[300px] shrink-0 border border-white/10 bg-charcoal px-4 py-8 sm:px-6 sm:py-10 text-center text-gray-300 text-sm">
                Best sellers are not available right now.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="trust" ref={trustRef} className="py-16 md:py-24 section-padding">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-3 block">
            Why Choose Us
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white">Our Promise</h2>
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
              Authentic <strong>BIS Hallmarked Gold Jewellery</strong> and IGI certified diamonds with 100% guarantee.
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
              We are the most <strong>Trusted Jewellery Store</strong> located near VRC Centre, Nellore.
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
              Discover intricate <strong>Antique Jewellery Nellore</strong> crafted by our master artisans.
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
              Bespoke wedding and bridal design services to bring your dream jewellery to life.
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section id="story" ref={storyRef} className="py-16 md:py-24 section-padding bg-charcoal border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-8 md:mb-12 story-content">
            <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-3 block">
              Legacy & Heritage of
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white">SHANTI JEWELLERY</h2>
          </div>
          
          <div className="relative w-full aspect-video mb-10 md:mb-16">
            <iframe
              className="w-full h-full shadow-2xl rounded-sm"
              src="https://www.youtube.com/embed/M3qSUH2_soo?autoplay=1&mute=1&loop=1&playlist=M3qSUH2_soo"
              title="Shanti Jewellers Nellore Our Story"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 0 }}
            ></iframe>
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 text-gray-300 text-base md:text-lg leading-relaxed px-4">
            <p>
              <span className="text-white font-serif tracking-wider text-lg md:text-xl">SHANTI JEWELLERY</span> was established in the year 1960. Our grandfather Late Sri <span className="text-gold font-medium">JETMAL JAIN</span> Garu established this shop. He is affectionately known as RAMANAIYA GARU.
            </p>
            <p>
              This is our third generation in the jewellery business. Each and every ornament carries the <strong className="text-white font-medium">BIS 916 HALLMARK</strong>. All our diamond jewellery is <strong className="text-white font-medium">IGI CERTIFIED</strong>. We never compromise on quality, and customisation is one of our specialties.
            </p>
            <p>
              We provide premium GOLD & DIAMOND jewellery with the finest craftsmanship and finely assorted, superior-quality stones. If you are looking for the <strong>Best Jewellery Shop in Nellore</strong>, our handpicked pieces offer unmatched elegance.
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

      {/* NEW: Comprehensive Local SEO Content & FAQ Section */}
      <section ref={seoSectionRef} className="py-16 md:py-24 section-padding bg-charcoal-dark border-t border-white/5">
        <div className="max-w-4xl mx-auto text-gray-300">
          
          <div className="text-center mb-12 seo-content-block">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">Nellore's Finest Jewellery Collections</h2>
            <div className="w-16 h-[2px] bg-gold mx-auto mb-6"></div>
          </div>

          <div className="space-y-12 seo-content-block">
            {/* SEO Article Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-serif text-white mb-3 text-gold">Bridal Jewellery in Nellore</h3>
                <p className="text-sm md:text-base leading-relaxed">
                  Your wedding day deserves perfection. As the leading destination for <strong>Wedding Jewellery in Nellore</strong>, we craft exquisite bridal sets that blend traditional South Indian aesthetics with modern elegance. From heavy temple-inspired necklaces to delicate maang tikkas, our bridal trousseau makes every bride shine.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-serif text-white mb-3 text-gold">Exclusive Gold & Diamond Range</h3>
                <p className="text-sm md:text-base leading-relaxed">
                  Explore our vast collection ranging from <strong>Lightweight Gold Jewellery</strong> perfect for daily wear, to spectacular statement pieces. Whether you're searching for authentic <strong>Gold Chains in Nellore</strong> or a brilliantly cut <strong>Diamond Jewellery Store in Nellore</strong>, Shanti Jewellery offers unmatched purity and value.
                </p>
              </div>
            </div>

            {/* Customer Reviews Highlight */}
            <div className="bg-charcoal border border-white/10 p-8 rounded-sm text-center my-10">
              <h3 className="text-2xl font-serif text-white mb-4">Loved by Generations in Nellore</h3>
              <div className="flex justify-center gap-1 text-gold mb-4">
                {[1,2,3,4,5].map(star => <span key={star}>★</span>)}
              </div>
              <p className="italic text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                "Shanti Jewellers has been our family's trusted gold shop for decades. Their custom designs and BIS 916 purity guarantee make them the best jewellery shop near VRC Centre."
              </p>
              <p className="mt-4 font-semibold text-white tracking-wider text-sm">— Rated 4.8 Stars on Google</p>
            </div>

            {/* FAQ Section */}
            <div>
              <h3 className="text-2xl font-serif text-white mb-6 text-center">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <details className="group border border-white/10 bg-charcoal p-4 cursor-pointer">
                  <summary className="flex justify-between items-center font-medium text-white">
                    What is the best jewellery shop in Nellore?
                    <span className="transition group-open:rotate-180 text-gold"><ChevronDown size={20} /></span>
                  </summary>
                  <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                    SHANTI JEWELLERY is widely recognized as the best jewellery shop in Nellore, serving customers since 1960 with premium gold, diamond, and bridal collections.
                  </p>
                </details>
                <details className="group border border-white/10 bg-charcoal p-4 cursor-pointer">
                  <summary className="flex justify-between items-center font-medium text-white">
                    Does SHANTI JEWELLERY provide BIS Hallmarked jewellery?
                    <span className="transition group-open:rotate-180 text-gold"><ChevronDown size={20} /></span>
                  </summary>
                  <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                    Yes, every gold ornament at SHANTI JEWELLERY carries the authentic BIS 916 Hallmark guarantee ensuring absolute purity.
                  </p>
                </details>
                <details className="group border border-white/10 bg-charcoal p-4 cursor-pointer">
                  <summary className="flex justify-between items-center font-medium text-white">
                    Where is SHANTI JEWELLERY located in Nellore?
                    <span className="transition group-open:rotate-180 text-gold"><ChevronDown size={20} /></span>
                  </summary>
                  <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                    We are centrally located at 2-148, Barkas Center, 17, Achari St, Beside SBI, VRC Centre, Nellore, Andhra Pradesh 524001.
                  </p>
                </details>
                <details className="group border border-white/10 bg-charcoal p-4 cursor-pointer">
                  <summary className="flex justify-between items-center font-medium text-white">
                    Does SHANTI JEWELLERY offer bridal jewellery?
                    <span className="transition group-open:rotate-180 text-gold"><ChevronDown size={20} /></span>
                  </summary>
                  <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                    Yes, we specialize in exclusive Bridal Jewellery in Nellore, offering custom wedding jewellery collections, gold necklaces, bangles, and temple jewellery.
                  </p>
                </details>
                <details className="group border border-white/10 bg-charcoal p-4 cursor-pointer">
                  <summary className="flex justify-between items-center font-medium text-white">
                    What are the store timings?
                    <span className="transition group-open:rotate-180 text-gold"><ChevronDown size={20} /></span>
                  </summary>
                  <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                    Our store is open from Monday to Saturday, 10:00 AM to 8:30 PM. We are closed on Sundays.
                  </p>
                </details>
              </div>
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
            Our jewelry experts at the VRC Centre store are here to help you discover the perfect piece.
            Book an appointment for a personalized consultation or reach out to us on WhatsApp.
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
      <section id="visit" ref={mapSectionRef} className="py-16 md:py-24 section-padding bg-charcoal relative border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-3 block">Our Location in Nellore</span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-4 md:mb-6">Visit Shanti Jewellers</h2>
            <div className="w-12 h-[2px] md:w-16 bg-gold mx-auto mb-4 md:mb-6"></div>
            <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto">
              We invite you to our flagship store near SBI Barkas Center to explore our exclusive collections.
            </p>
          </div>

          {/* Info Cards Grid */}
          <div className="map-floating-card grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
            {/* Address Card */}
            <address className="bg-charcoal-dark not-italic border border-white/10 p-6 md:p-8 text-center hover:border-gold/50 transition-colors duration-500 group flex flex-col items-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-charcoal border border-gold/30 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-gold" />
              </div>
              <h3 className="text-white font-serif text-lg md:text-xl mb-3">Address</h3>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 flex-grow">
                2-148, Barkas Center,<br />
                17, Achari St, beside SBI,<br />
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
              <h3 className="text-white font-serif text-lg md:text-xl mb-3">Contact</h3>
              <div className="flex-grow flex flex-col justify-center space-y-1 md:space-y-2">
                <a href="tel:09039039056" className="text-gray-400 hover:text-gold transition-colors text-base md:text-lg">
                  +91 90390 39056
                </a>
                <a href="tel:09039039057" className="text-gray-400 hover:text-gold transition-colors text-base md:text-lg">
                  +91 90390 39057
                </a>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-charcoal-dark border border-white/10 p-6 md:p-8 text-center hover:border-gold/50 transition-colors duration-500 group flex flex-col items-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-charcoal border border-gold/30 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-gold" />
              </div>
              <h3 className="text-white font-serif text-lg md:text-xl mb-3">Store Hours</h3>
              <div className="flex-grow flex flex-col justify-center">
                <p className="text-gray-400 text-xs md:text-sm mb-1 md:mb-2">Monday - Saturday</p>
                <p className="text-white font-medium mb-3 md:mb-4 text-sm md:text-base">10:00 AM - 8:30 PM</p>
                <p className="text-gold/80 text-[10px] md:text-xs tracking-widest uppercase">Sunday Closed</p>
              </div>
            </div>
          </div>

          {/* Panoramic Map */}
          <div className="map-floating-card w-full relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 via-gold/5 to-gold/20 blur-sm"></div>
            <div className="relative w-full h-[300px] md:h-[450px] bg-charcoal-light border border-white/20 p-2">
              <iframe
                title="Shanti Jewellers Nellore Google Maps Location"
                src="https://www.google.com/maps?q=Shanti+Jewellers,+17/440,+Achari+St,+Nellore,+Andhra+Pradesh+524001&output=embed"
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
                alt="Shanti Jewellers Logo Nellore"
                loading="lazy"
                className="w-10 h-10 md:w-12 md:h-12 lg:w-[60px] lg:h-14 object-contain"
              />
              <span className="font-serif text-lg md:text-xl tracking-wider uppercase">
                SHANTI <span className="text-gold">JEWELLERS</span>
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
            <h4 className="font-serif text-base md:text-lg text-white mb-4 md:mb-6">Quick Links</h4>
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
                  href="#categories"
                  className="text-gray-400 hover:text-gold transition-colors text-xs md:text-sm"
                >
                  Categories
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
            <h4 className="font-serif text-base md:text-lg text-white mb-4 md:mb-6">Contact</h4>
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
                <span className="text-gray-400 text-xs md:text-sm">+91 90390 39056</span>
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
                      <span className="text-white text-sm md:text-base">18K Gold</span>
                    </div>
                    <div className="flex-1 border border-white/10 p-2 md:p-3 text-center rounded-sm">
                      <span className="text-gray-400 text-[10px] md:text-xs block">
                        Weight
                      </span>
                      <span className="text-white text-sm md:text-base">12.5g</span>
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
              Schedule a personalized consultation with our jewelry experts at our Nellore branch.
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