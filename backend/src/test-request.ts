import { Request } from "express";

function test(req: Request) {
  if (req.customer) {
    console.log(req.customer.customerId);
    console.log(req.customer.tenantId);
    console.log(req.customer.role);
  }
}