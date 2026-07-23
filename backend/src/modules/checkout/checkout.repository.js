"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutRepository = exports.CheckoutRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const prisma_1 = require("../../lib/prisma");
class CheckoutRepository extends base_repository_1.BaseRepository {
    constructor() {
        super("checkoutSession");
    }
    async getCouponByCode(tenantId, code) {
        return await prisma_1.prisma.coupon.findUnique({
            where: {
                tenantId_code: { tenantId, code },
            }
        });
    }
    async createSession(data) {
        return await this.model.create({ data });
    }
    async getSessionById(tenantId, customerId, sessionId) {
        return await this.model.findUnique({
            where: { id: sessionId },
            include: {
                address: true,
                coupon: true,
                cart: {
                    include: { items: true }
                }
            }
        });
    }
}
exports.CheckoutRepository = CheckoutRepository;
exports.checkoutRepository = new CheckoutRepository();
