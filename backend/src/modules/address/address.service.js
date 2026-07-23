"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressService = exports.AddressService = void 0;
const address_repository_1 = require("./address.repository");
const AppError_1 = require("../../utils/AppError");
class AddressService {
    async createAddress(tenantId, customerId, data) {
        // If it's the first address, make it default automatically
        const existingAddresses = await address_repository_1.addressRepository.findAllByUser(tenantId, customerId);
        if (existingAddresses.length === 0) {
            data.isDefault = true;
        }
        if (data.isDefault) {
            await address_repository_1.addressRepository.unsetDefaultForUser(tenantId, customerId);
        }
        return await address_repository_1.addressRepository.create({
            ...data,
            tenantId,
            customerId,
        });
    }
    async getUserAddresses(tenantId, customerId) {
        return await address_repository_1.addressRepository.findAllByUser(tenantId, customerId);
    }
    async getAddressById(tenantId, customerId, addressId) {
        const address = await address_repository_1.addressRepository.findById(addressId);
        if (!address || address.tenantId !== tenantId || address.customerId !== customerId) {
            throw new AppError_1.AppError("Address not found", 404);
        }
        return address;
    }
    async updateAddress(tenantId, customerId, addressId, data) {
        await this.getAddressById(tenantId, customerId, addressId); // Verify ownership
        if (data.isDefault) {
            await address_repository_1.addressRepository.unsetDefaultForUser(tenantId, customerId);
        }
        return await address_repository_1.addressRepository.update(addressId, data);
    }
    async deleteAddress(tenantId, customerId, addressId) {
        const address = await this.getAddressById(tenantId, customerId, addressId);
        await address_repository_1.addressRepository.delete(addressId);
        // If deleted address was default, make the most recent one default
        if (address.isDefault) {
            const remaining = await address_repository_1.addressRepository.findAllByUser(tenantId, customerId);
            if (remaining.length > 0) {
                await address_repository_1.addressRepository.update(remaining[0].id, { isDefault: true });
            }
        }
        return true;
    }
}
exports.AddressService = AddressService;
exports.addressService = new AddressService();
