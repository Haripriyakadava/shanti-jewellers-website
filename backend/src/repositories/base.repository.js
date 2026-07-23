"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const prisma_1 = require("../lib/prisma");
class BaseRepository {
    model;
    constructor(modelName) {
        this.model = prisma_1.prisma[modelName];
    }
    async findById(id) {
        return await this.model.findUnique({
            where: { id },
        });
    }
    async findAll(tenantId) {
        return await this.model.findMany({
            where: { tenantId },
        });
    }
    async create(data) {
        return await this.model.create({
            data,
        });
    }
    async update(id, data) {
        return await this.model.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await this.model.delete({
            where: { id },
        });
    }
}
exports.BaseRepository = BaseRepository;
