import { Request, Response } from "express";
import { addressService } from "./address.service";
import { createAddressSchema, updateAddressSchema } from "./address.validation";
import { ResponseFormatter } from "../../utils/ResponseFormatter";

export class AddressController {
  async createAddress(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const validatedData = createAddressSchema.parse(req.body);
    const address = await addressService.createAddress(tenantId, customerId, validatedData);
    return ResponseFormatter.success(res, address, "Address created successfully", 201);
  }

  async getUserAddresses(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const addresses = await addressService.getUserAddresses(tenantId, customerId);
    return ResponseFormatter.success(res, addresses, "Addresses retrieved successfully");
  }

  async getAddressById(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const addressId = req.params.id as string;
    const address = await addressService.getAddressById(tenantId, customerId, addressId);
    return ResponseFormatter.success(res, address, "Address retrieved successfully");
  }

  async updateAddress(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const addressId = req.params.id as string;
    const validatedData = updateAddressSchema.parse(req.body);
    const address = await addressService.updateAddress(tenantId, customerId, addressId, validatedData);
    return ResponseFormatter.success(res, address, "Address updated successfully");
  }

  async deleteAddress(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const addressId = req.params.id as string;
    await addressService.deleteAddress(tenantId, customerId, addressId);
    return ResponseFormatter.success(res, null, "Address deleted successfully");
  }
}

export const addressController = new AddressController();
