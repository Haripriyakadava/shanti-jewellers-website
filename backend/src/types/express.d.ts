import { JwtPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      customer?: {
        customerId: string;
        tenantId: string;
        role: string;
      };
      tenant?: import("@prisma/client").Tenant;
      tenantId?: string;
    }
  }
}

export {};