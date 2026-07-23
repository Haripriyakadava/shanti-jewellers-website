"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressController = exports.AddressController = void 0;
const address_service_1 = require("./address.service");
const address_validation_1 = require("./address.validation");
const ResponseFormatter_1 = require("../../utils/ResponseFormatter");
class AddressController {
    async createAddress(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const validatedData = address_validation_1.createAddressSchema.parse(req.body);
        const address = await address_service_1.addressService.createAddress(tenantId, customerId, validatedData);
        return ResponseFormatter_1.ResponseFormatter.success(res, address, "Address created successfully", 201);
    }
    async getUserAddresses(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const addresses = await address_service_1.addressService.getUserAddresses(tenantId, customerId);
        return ResponseFormatter_1.ResponseFormatter.success(res, addresses, "Addresses retrieved successfully");
    }
    async getAddressById(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const addressId = req.params.id;
        const address = await address_service_1.addressService.getAddressById(tenantId, customerId, addressId);
        return ResponseFormatter_1.ResponseFormatter.success(res, address, "Address retrieved successfully");
    }
    async updateAddress(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const addressId = req.params.id;
        const validatedData = address_validation_1.updateAddressSchema.parse(req.body);
        const address = await address_service_1.addressService.updateAddress(tenantId, customerId, addressId, validatedData);
        return ResponseFormatter_1.ResponseFormatter.success(res, address, "Address updated successfully");
    }
    async deleteAddress(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const addressId = req.params.id;
        await address_service_1.addressService.deleteAddress(tenantId, customerId, addressId);
        return ResponseFormatter_1.ResponseFormatter.success(res, null, "Address deleted successfully");
    }
}
exports.AddressController = AddressController;
exports.addressController = new AddressController();
