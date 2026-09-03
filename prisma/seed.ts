import "dotenv/config";
import crypto from "crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  const url = new URL(databaseUrl);
  const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});
  return new PrismaClient({ adapter });
}

const prisma = createClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const customerPassword = await bcrypt.hash("customer123", 12);

  // Helper to upsert role by slug
  const getOrCreateRole = async (name: string, slug: string, description: string) => {
    let role = await prisma.role.findFirst({ where: { slug } });
    if (!role) {
      role = await prisma.role.create({
        data: { name, slug, description },
      });
    }
    return role;
  };

  const adminRole = await getOrCreateRole("ADMIN", "admin", "Administrator with full access");
  const staffRole = await getOrCreateRole("STAFF", "staff", "Staff member with limited access");
  const customerRole = await getOrCreateRole("CUSTOMER", "customer", "Regular customer");

  console.log("Roles created");

  const permissions = [
    { name: "PRODUCT_VIEW", slug: "product-view", module: "PRODUCT" },
    { name: "PRODUCT_CREATE", slug: "product-create", module: "PRODUCT" },
    { name: "PRODUCT_UPDATE", slug: "product-update", module: "PRODUCT" },
    { name: "PRODUCT_DELETE", slug: "product-delete", module: "PRODUCT" },
    { name: "CATEGORY_VIEW", slug: "category-view", module: "CATEGORY" },
    { name: "CATEGORY_CREATE", slug: "category-create", module: "CATEGORY" },
    { name: "CATEGORY_UPDATE", slug: "category-update", module: "CATEGORY" },
    { name: "CATEGORY_DELETE", slug: "category-delete", module: "CATEGORY" },
    { name: "ORDER_VIEW", slug: "order-view", module: "ORDER" },
    { name: "ORDER_UPDATE", slug: "order-update", module: "ORDER" },
    { name: "USER_VIEW", slug: "user-view", module: "USER" },
    { name: "USER_UPDATE", slug: "user-update", module: "USER" },
  ];

  for (const perm of permissions) {
    let created = await prisma.permission.findFirst({ where: { slug: perm.slug } });
    if (!created) {
      created = await prisma.permission.create({ data: perm });
    }
    const existingRp = await prisma.rolePermission.findFirst({
      where: { roleId: adminRole.id, permissionId: created.id },
    });
    if (!existingRp) {
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: created.id },
      });
    }
  }

  console.log("Permissions created and assigned to admin role");

  let adminUser = await prisma.user.findFirst({
    where: { email: "admin@kollimalaiarasan.com" },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        uuid: crypto.randomUUID(),
        name: "Admin",
        email: "admin@kollimalaiarasan.com",
        password_hash: adminPassword,
        role: { connect: { id: adminRole.id } },
        status: "active",
        email_verified_at: new Date(),
      },
    });
  } else {
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        email: "admin@kollimalaiarasan.com",
        uuid: adminUser.uuid || crypto.randomUUID(),
      },
    });
  }

  let staffUser = await prisma.user.findFirst({ where: { email: "staff@kollimalaiarasan.com" } });
  if (!staffUser) {
    const staffPassword = await bcrypt.hash("staff123", 12);
    staffUser = await prisma.user.create({
      data: {
        uuid: crypto.randomUUID(),
        name: "Staff Member",
        email: "staff@kollimalaiarasan.com",
        password_hash: staffPassword,
        role: { connect: { id: staffRole.id } },
        status: "active",
        email_verified_at: new Date(),
      },
    });
  } else if (!staffUser.uuid) {
    await prisma.user.update({
      where: { id: staffUser.id },
      data: { uuid: crypto.randomUUID() },
    });
  }

  let customerUser = await prisma.user.findFirst({ where: { email: "customer@example.com" } });
  if (!customerUser) {
    customerUser = await prisma.user.create({
      data: {
        uuid: crypto.randomUUID(),
        name: "John Customer",
        email: "customer@example.com",
        password_hash: customerPassword,
        role: { connect: { id: customerRole.id } },
        status: "active",
        email_verified_at: new Date(),
      },
    });
  } else if (!customerUser.uuid) {
    await prisma.user.update({
      where: { id: customerUser.id },
      data: { uuid: crypto.randomUUID() },
    });
  }

  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        uuid: crypto.randomUUID(),
        companyName: "Kollimalai Arasan",
        state: "Tamil Nadu",
        country: "India",
        isActive: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      },
    });
    console.log("Default company settings created for Kollimalai Arasan");
  } else if (company.companyName !== "Kollimalai Arasan") {
    company = await prisma.company.update({
      where: { id: company.id },
      data: {
        companyName: "Kollimalai Arasan",
        state: "Tamil Nadu",
        country: "India",
        updatedBy: adminUser.id,
      },
    });
    console.log("Updated existing company settings to Kollimalai Arasan");
  }

  console.log("Users created/updated with UUIDs");
  console.log("\n--- Seed Complete ---");
  console.log("Admin Login: admin@kollimalaiarasan.com / admin123");
  console.log("Staff Login: staff@kollimalaiarasan.com / staff123");
  console.log("Customer Login: customer@example.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
