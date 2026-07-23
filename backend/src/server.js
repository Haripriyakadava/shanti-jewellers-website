"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = require("./lib/prisma");
async function startServer() {
    try {
        await prisma_1.prisma.$connect();
        console.log("✅ PostgreSQL Connected");
        app_1.default.listen(env_1.env.PORT, () => {
            console.log(`🚀 Server running at http://localhost:${env_1.env.PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server");
        console.error(error);
        process.exit(1);
    }
}
startServer();
