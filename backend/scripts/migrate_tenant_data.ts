import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const prisma = new PrismaClient();

const safeStr = (s: any) => s != null ? String(s) : null;

async function migrateTenantData() {
  console.log("Starting Tenant Data migration from Supabase to Prisma...");

  try {
    const { data: tenants, error } = await supabase.from("tenants").select("*");
    if (error && error.code !== '42P01') throw error;
    
    let updatedCount = 0;
    
    for (const t of tenants || []) {
      const tenantId = safeStr(t.id);
      if (!tenantId) continue;
      
      const slug = safeStr(t.slug) || tenantId; // fallback
      
      console.log(`Updating tenant ${tenantId}...`);
      
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          slug: slug,
          ownerId: (await prisma.adminUser.findUnique({where:{id: safeStr(t.owner_id) || ''}})) ? safeStr(t.owner_id) : null,
          website: safeStr(t.website_link),
          phoneNumber1: safeStr(t.phone_num1),
          phoneNumber2: safeStr(t.phone_num2),
        }
      });
      
      updatedCount++;
    }
    
    console.log(`Successfully updated ${updatedCount} tenants.`);
    
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateTenantData();
