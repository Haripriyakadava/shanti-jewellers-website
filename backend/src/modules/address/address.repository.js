"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressRepository = exports.AddressRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
class AddressRepository extends base_repository_1.BaseRepository {
    constructor() {
        super("address");
    }
    async findAllByUser(tenantId, customerId) {
        return await this.model.findMany({
            where: { tenantId, customerId },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ],
        });
    }
    async unsetDefaultForUser(tenantId, customerId) {
        await this.model.updateMany({
            where: { tenantId, customerId, isDefault: true },
            data: { isDefault: false },
        });
    }
    async findDefaultAddress(tenantId, customerId) {
        return await this.model.findFirst({
            where: { tenantId, customerId, isDefault: true },
        });
    }
}
exports.AddressRepository = AddressRepository;
exports.addressRepository = new AddressRepository();
