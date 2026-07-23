import { addressRepository } from "./address.repository";
import { CreateAddressInput, UpdateAddressInput } from "./address.types";
import { AppError } from "../../utils/AppError";

export class AddressService {
  async createAddress(tenantId: string, customerId: string, data: CreateAddressInput) {
    // If it's the first address, make it default automatically
    const existingAddresses = await addressRepository.findAllByUser(tenantId, customerId);
    if (existingAddresses.length === 0) {
      data.isDefault = true;
    }

    if (data.isDefault) {
      await addressRepository.unsetDefaultForUser(tenantId, customerId);
    }

    return await addressRepository.create({
      ...data,
      tenantId,
      customerId,
    });
  }

  async getUserAddresses(tenantId: string, customerId: string) {
    return await addressRepository.findAllByUser(tenantId, customerId);
  }

  async getAddressById(tenantId: string, customerId: string, addressId: string) {
    const address = await addressRepository.findById(addressId);
    if (!address || address.tenantId !== tenantId || address.customerId !== customerId) {
      throw new AppError("Address not found", 404);
    }
    return address;
  }

  async updateAddress(tenantId: string, customerId: string, addressId: string, data: UpdateAddressInput) {
    await this.getAddressById(tenantId, customerId, addressId); // Verify ownership

    if (data.isDefault) {
      await addressRepository.unsetDefaultForUser(tenantId, customerId);
    }

    return await addressRepository.update(addressId, data);
  }

  async deleteAddress(tenantId: string, customerId: string, addressId: string) {
    const address = await this.getAddressById(tenantId, customerId, addressId);
    
    await addressRepository.delete(addressId);

    // If deleted address was default, make the most recent one default
    if (address.isDefault) {
      const remaining = await addressRepository.findAllByUser(tenantId, customerId);
      if (remaining.length > 0) {
        await addressRepository.update(remaining[0].id, { isDefault: true });
      }
    }
    
    return true;
  }
}

export const addressService = new AddressService();
