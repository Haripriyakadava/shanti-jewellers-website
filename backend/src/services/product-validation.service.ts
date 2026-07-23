import { prisma } from "../lib/prisma";

export interface ProductDetails {
  id: string;
  tenantId: string;
  isActive: boolean;
  name: string;
  sku: string;
  // NOTE: Prisma's Product schema does not inherently have "basePrice", "price", "makingCharge" etc in a flat structure,
  // except perhaps for `makingCharges`.
  // Since this interface is consumed by other parts of the app, we keep the properties the same
  // but populate them if possible. Let's make it compatible with the previous any-cast.
  [key: string]: any;
}

export class ProductValidationService {
  /**
   * Fetches a single product from Prisma and validates its existence,
   * tenant ownership, and active status.
   */
  async getValidProduct(tenantId: string, productId: string): Promise<ProductDetails> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    if (product.tenantId !== tenantId) {
      throw new Error(`Product does not belong to the requested tenant`);
    }

    if (!product.isActive) {
      throw new Error(`Product is currently inactive and cannot be purchased`);
    }

    return product as unknown as ProductDetails;
  }

  /**
   * Fetches multiple products from Prisma at once.
   */
  async getBulkProducts(tenantId: string, productIds: string[]): Promise<ProductDetails[]> {
    if (!productIds || productIds.length === 0) return [];

    const products = await prisma.product.findMany({
      where: {
        tenantId: tenantId,
        id: { in: productIds },
      },
    });

    return products as unknown as ProductDetails[];
  }
}

export const productValidationService = new ProductValidationService();
