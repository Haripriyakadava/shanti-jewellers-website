import { BaseRepository } from "../../repositories/base.repository";
import { Wishlist, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export class WishlistRepository extends BaseRepository<Wishlist> {
  constructor() {
    super("wishlist");
  }

  async getWishlist(tenantId: string, customerId: string) {
    return await this.model.findMany({
      where: { tenantId, customerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async addProduct(tenantId: string, customerId: string, productId: string, productVariantId?: string) {
    return await prisma.wishlist.upsert({
      where: {
        customerId_productId_productVariantId: {
          customerId,
          productId,
          productVariantId: productVariantId || "",
        },
      },
      update: {}, // if exists, do nothing
      create: {
        tenantId,
        customerId,
        productId,
        productVariantId: productVariantId || "",
      },
    });
  }

  async removeProduct(tenantId: string, customerId: string, productId: string, productVariantId?: string) {
    return await prisma.wishlist.deleteMany({
      where: {
        tenantId,
        customerId,
        productId,
        productVariantId: productVariantId || "",
      },
    });
  }
}

export const wishlistRepository = new WishlistRepository();
