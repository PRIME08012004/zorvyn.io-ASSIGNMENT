import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Salary", type: "INCOME" },
  { name: "Freelance", type: "INCOME" },
  { name: "Investment", type: "INCOME" },
  { name: "Other Income", type: "INCOME" },
  { name: "Rent", type: "EXPENSE" },
  { name: "Utilities", type: "EXPENSE" },
  { name: "Groceries", type: "EXPENSE" },
  { name: "Transport", type: "EXPENSE" },
  { name: "Entertainment", type: "EXPENSE" },
  { name: "Healthcare", type: "EXPENSE" },
  { name: "Subscriptions", type: "EXPENSE" },
  { name: "Other Expense", type: "EXPENSE" },
];

async function main() {
  const hash = (p) => bcrypt.hash(p, 10);

  await prisma.user.upsert({
    where: { email: "admin@finance.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@finance.com",
      password: await hash("admin123"),
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: "analyst@finance.com" },
    update: {},
    create: {
      name: "Analyst User",
      email: "analyst@finance.com",
      password: await hash("analyst123"),
      role: "ANALYST",
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@finance.com" },
    update: {},
    create: {
      name: "Viewer User",
      email: "viewer@finance.com",
      password: await hash("viewer123"),
      role: "VIEWER",
      status: "ACTIVE",
    },
  });

  for (const c of categories) {
    await prisma.category.upsert({
      where: {
        name_type: { name: c.name, type: c.type },
      },
      update: {},
      create: { name: c.name, type: c.type },
    });
  }

  console.log("Seed completed: 3 users, 12 categories.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
