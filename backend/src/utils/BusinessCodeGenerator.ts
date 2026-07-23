import crypto from "crypto";

export class BusinessCodeGenerator {
  static async generateCode(tx: any, tenantId: string, entityType: string, prefix: string, entityPrefix: string, padding: number = 6) {
    const randomHex = crypto.randomBytes(Math.ceil(padding / 2)).toString('hex').toUpperCase().slice(0, padding);
    return `${prefix}-${entityPrefix}-${randomHex}-${Date.now().toString().slice(-4)}`;
  }
}
