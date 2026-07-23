import { BaseRepository } from "../../repositories/base.repository";
import { Address, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export class AddressRepository extends BaseRepository<Address> {
  constructor() {
    super("address");
  }

  async findAllByUser(tenantId: string, customerId: string): Promise<Address[]> {
    return await this.model.findMany({
      where: { tenantId, customerId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
    });
  }

  async unsetDefaultForUser(tenantId: string, customerId: string): Promise<void> {
    await this.model.updateMany({
      where: { tenantId, customerId, isDefault: true },
      data: { isDefault: false },
    });
  }

  async findDefaultAddress(tenantId: string, customerId: string): Promise<Address | null> {
    return await this.model.findFirst({
      where: { tenantId, customerId, isDefault: true },
    });
  }
}

export const addressRepository = new AddressRepository();
