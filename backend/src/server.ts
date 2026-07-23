import app from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

async function startServer() {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSQL Connected");

    app.listen(env.PORT, () => {
      console.log(
        `🚀 Server running at http://localhost:${env.PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);
    process.exit(1);
  }
}

startServer();