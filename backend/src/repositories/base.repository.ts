import { prisma } from "../lib/prisma";

export class BaseRepository<T extends { id: string }> {
  protected model: any;

  constructor(modelName: string) {
    this.model = (prisma as any)[modelName];
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({
      where: { id },
    });
  }

  async findAll(tenantId: string): Promise<T[]> {
    return await this.model.findMany({
      where: { tenantId },
    });
  }

  async create(data: any): Promise<T> {
    return await this.model.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<T> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return await this.model.delete({
      where: { id },
    });
  }
}
