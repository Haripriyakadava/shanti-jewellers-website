"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function test(req) {
    if (req.customer) {
        console.log(req.customer.customerId);
        console.log(req.customer.tenantId);
        console.log(req.customer.role);
    }
}
