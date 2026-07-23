import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const prisma = new PrismaClient();

const safeStr = (s: any) => s != null ? String(s) : null;
const safeDate = (d: any) => d ? new Date(d) : null;
const safeBool = (b: any, fallback: boolean) => b != null ? Boolean(b) : fallback;

async function migrateAdminUsers() {
  console.log("Starting AdminUser migration from Supabase to Prisma...");

  try {
    const { data: adminUsers, error } = await supabase.from("admin_users").select("*");
    if (error && error.code !== '42P01') throw error;
    
    let updatedCount = 0;
    
    // Group by tenant to assign isOwner correctly
    const tenantAdmins: Record<string, any[]> = {};
    for (const u of adminUsers || []) {
      const tId = safeStr(u.tenant_id);
      if (!tId) continue;
      if (!tenantAdmins[tId]) tenantAdmins[tId] = [];
      tenantAdmins[tId].push(u);
    }

    let empCounter = 1;

    for (const [tenantId, users] of Object.entries(tenantAdmins)) {
      // Sort users by created_at to make the first one the owner
      users.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

      let isFirst = true;

      for (const u of users) {
        const id = safeStr(u.id);
        if (!id) continue;
        
        console.log(`Updating admin user ${id}...`);
        
        // Auto-generate employee code
        const empCode = `EMP${String(empCounter).padStart(3, '0')}`;
        empCounter++;

        // Try mapping role, default to MANAGER if invalid
        let mappedRole: any = "MANAGER";
        const allowedRoles = ["OWNER", "SUPER_ADMIN", "ADMIN", "MANAGER", "SALES", "ACCOUNTANT", "INVENTORY_MANAGER", "STAFF"];
        if (allowedRoles.includes(u.role)) {
            mappedRole = u.role;
        }

        await prisma.adminUser.upsert({
          where: { id: id },
          update: {
            email: safeStr(u.email) || `${id}@temp.com`,
            fullName: safeStr(u.full_name),
            role: mappedRole,
            isActive: safeBool(u.is_active, true),
            lastLogin: safeDate(u.last_login),
            tenantId: tenantId,
            createdAt: safeDate(u.created_at) || new Date(),
            updatedAt: safeDate(u.updated_at) || new Date(),
            
            // New defaults
            passwordHash: null,
            firstName: null,
            lastName: null,
            phoneNumber: null,
            profileImage: null,
            department: null,
            designation: null,
            employeeCode: empCode,
            isOwner: isFirst,
            isVerified: true,
            passwordChangedAt: null,
            deletedAt: null
          },
          create: {
            id: id,
            email: safeStr(u.email) || `${id}@temp.com`,
            fullName: safeStr(u.full_name),
            role: mappedRole,
            isActive: safeBool(u.is_active, true),
            lastLogin: safeDate(u.last_login),
            tenantId: tenantId,
            createdAt: safeDate(u.created_at) || new Date(),
            updatedAt: safeDate(u.updated_at) || new Date(),
            
            // New defaults
            passwordHash: null,
            firstName: null,
            lastName: null,
            phoneNumber: null,
            profileImage: null,
            department: null,
            designation: null,
            employeeCode: empCode,
            isOwner: isFirst,
            isVerified: true,
            passwordChangedAt: null,
            deletedAt: null
          }
        });
        
        isFirst = false;
        updatedCount++;
      }
    }
    
    console.log(`Successfully migrated/updated ${updatedCount} admin users.`);
    
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateAdminUsers();
