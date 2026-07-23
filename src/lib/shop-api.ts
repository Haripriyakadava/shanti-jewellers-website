import { fetchApi } from './api-client';

export type ShopMetalPriceTickerItem = {
  id: string;
  metal: string;
  purity: string;
  pricePerGram: number;
  price?: number;
  unit?: string;
  trend: 'up' | 'down' | 'neutral';
  lastUpdated: string;
};

export type ShopCollection = {
  id: string | number;
  name: string;
  slug: string;
  description: string | null;
  subtitle?: string | null;
  image: string;
  createdAt: string;
  displayOrder: number;
};

export type ShopCategory = {
  id: string | number;
  name: string;
  slug: string;
  description: string | null;
  image: string;
  createdAt: string;
  displayOrder: number;
};

export type ShopProductCard = {
  id: string | number;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  collectionSlug: string | null;
  price: number;
  image: string;
  hoverImage: string | null;
  rating: number;
  isNew: boolean;
  isBestSeller: boolean;
  engravable: boolean;
  metal: string;
  createdAt: string;
  reviewsCount: number;
  badges?: string[];
  reviews?: any[];
};

export type ShopCollectionProduct = ShopProductCard;
export type ShopProductDetail = any;

export async function fetchMetalPriceTicker(): Promise<ShopMetalPriceTickerItem[]> {
  try {
    const res = await fetchApi('/metals/ticker');
    return res.data || [];
  } catch (e) {
    return [];
  }
}

export async function fetchAllCollections(): Promise<ShopCollection[]> {
  const res = await fetchApi('/collections');
  return res.data.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.imageUrl || 'https://images.unsplash.com/photo-1599643478524-fb66f70362f6',
    createdAt: c.createdAt || new Date().toISOString(),
    displayOrder: c.displayOrder || 0
  }));
}

export async function fetchAllCategories(): Promise<ShopCategory[]> {
  const res = await fetchApi('/categories');
  return res.data.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.imageUrl || 'https://images.unsplash.com/photo-1599643478524-fb66f70362f6',
    createdAt: c.createdAt || new Date().toISOString(),
    displayOrder: c.displayOrder || 0
  }));
}

export async function fetchCategoryBySlug(slug: string): Promise<ShopCategory | null> {
  try {
    const res = await fetchApi(`/categories/${slug}`);
    if (!res.data) return null;
    const c = res.data;
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.imageUrl || 'https://images.unsplash.com/photo-1599643478524-fb66f70362f6',
      createdAt: c.createdAt || new Date().toISOString(),
      displayOrder: c.displayOrder || 0
    };
  } catch {
    return null;
  }
}

function mapProduct(p: any): ShopProductCard {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.categoryName || 'Jewellery',
    categorySlug: p.categorySlug || 'jewellery',
    collectionSlug: p.collectionSlug || null,
    price: Number(p.basePrice || p.price || 0),
    image: p.image || p.imageUrl || 'https://images.unsplash.com/photo-1599643478524-fb66f70362f6',
    hoverImage: p.hoverImage || p.hoverImageUrl || null,
    rating: Number(p.rating || 5),
    isNew: Boolean(p.isNew),
    isBestSeller: Boolean(p.isBestSeller),
    engravable: Boolean(p.engravable),
    metal: p.metalType || 'Gold',
    createdAt: p.createdAt || new Date().toISOString(),
    reviewsCount: Number(p.reviewCount || 0)
  };
}

export async function fetchProductsByCategorySlug(slug: string): Promise<{ category: ShopCategory | null; products: ShopProductCard[] }> {
  const category = await fetchCategoryBySlug(slug);
  if (!category) return { category: null, products: [] };
  
  const res = await fetchApi(`/products?category=${slug}`);
  return {
    category,
    products: (res.data || []).map(mapProduct)
  };
}

export async function fetchBestSellerProducts(limit = 12): Promise<ShopProductCard[]> {
  const res = await fetchApi(`/products?isBestSeller=true&limit=${limit}`);
  return (res.data || []).map(mapProduct);
}

export async function fetchCollectionBySlug(slug: string): Promise<ShopCollection | null> {
  try {
    const res = await fetchApi(`/collections/${slug}`);
    if (!res.data) return null;
    const c = res.data;
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.imageUrl || 'https://images.unsplash.com/photo-1599643478524-fb66f70362f6',
      createdAt: c.createdAt || new Date().toISOString(),
      displayOrder: c.displayOrder || 0
    };
  } catch {
    return null;
  }
}

export async function fetchProductsByCollectionSlug(slug: string): Promise<{ collection: ShopCollection | null; products: ShopCollectionProduct[] }> {
  const collection = await fetchCollectionBySlug(slug);
  if (!collection) return { collection: null, products: [] };
  
  const res = await fetchApi(`/products?collection=${slug}`);
  return {
    collection,
    products: (res.data || []).map(mapProduct)
  };
}

export async function fetchProductDetailById(productId: string | number): Promise<ShopProductDetail | null> {
  try {
    const res = await fetchApi(`/products/${productId}`);
    if (!res.data) return null;
    const p = res.data;
    
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      longDescription: p.longDescription || null,
      price: Number(p.basePrice || 0),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      images: p.images?.map((img: any) => ({
        url: img.imageUrl,
        alt: img.altText || p.name,
        isPrimary: img.isPrimary
      })) || [{ url: p.imageUrl, alt: p.name, isPrimary: true }],
      variants: p.variants?.map((v: any) => ({
        id: v.id,
        sku: v.sku,
        name: v.name || p.name,
        price: Number(v.price || p.basePrice || 0),
        originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
        stock: v.stockQuantity || 10,
        attributes: v.attributes || {}
      })) || [],
      rating: Number(p.rating || 5),
      reviewsCount: 0,
      isNew: Boolean(p.isNew),
      isBestSeller: Boolean(p.isBestSeller),
      features: [],
      specifications: [
        { label: 'Metal', value: p.metalType || 'Gold' },
        { label: 'Gross Weight', value: p.grossWeight ? `${p.grossWeight}g` : 'N/A' },
        { label: 'SKU', value: p.sku }
      ],
      engravable: false,
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: p.category?.name || 'Shop', href: p.category ? `/category/${p.category.slug}` : '/shop' },
        { label: p.name, href: '#' },
      ],
      // Compatibility with old payload
      categoryName: p.category?.name,
      categorySlug: p.category?.slug,
      metalOptions: p.variants?.map((v: any) => v.attributes?.metal).filter(Boolean).length > 0 ? Array.from(new Set(p.variants.map((v: any) => v.attributes?.metal))) : [p.metalType || 'Gold'],
      caratOptions: p.variants?.map((v: any) => v.attributes?.carat).filter(Boolean).length > 0 ? Array.from(new Set(p.variants.map((v: any) => v.attributes?.carat))) : [p.grossWeight || 0],
      diamondOptions: p.variants?.map((v: any) => v.attributes?.diamond).filter(Boolean).length > 0 ? Array.from(new Set(p.variants.map((v: any) => v.attributes?.diamond))) : ['Natural'],
      gallery: p.images?.map((img: any) => img.imageUrl) || [p.imageUrl || 'https://images.unsplash.com/photo-1599643478524-fb66f70362f6'],
      image: p.imageUrl || (p.images?.[0]?.imageUrl) || 'https://images.unsplash.com/photo-1599643478524-fb66f70362f6',
      hoverImage: p.hoverImageUrl || null
    };
  } catch (e) {
    return null;
  }
}

export async function searchProducts(query: string, limit = 24): Promise<ShopProductCard[]> {
  if (!query) return [];
  const res = await fetchApi(`/products?search=${encodeURIComponent(query)}&limit=${limit}`);
  return (res.data || []).map(mapProduct);
}

export async function fetchProductsByIds(productIds: (string | number)[]): Promise<ShopProductCard[]> {
  if (!productIds || productIds.length === 0) return [];
  const res = await fetchApi(`/products?ids=${productIds.join(',')}`);
  return (res.data || []).map(mapProduct);
}