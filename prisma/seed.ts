import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createLocalAccountIssuer } from "@better-auth/core/db";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log("Seeding Deskdrop...");

  // Stationery is seeded too, it just isn't referenced by the demo listings.
  const [books, electronics, dorm] = await Promise.all([
    prisma.category.upsert({
      where: { slug: "books" },
      update: {},
      create: { name: "Books", slug: "books" },
    }),
    prisma.category.upsert({
      where: { slug: "electronics" },
      update: {},
      create: { name: "Electronics", slug: "electronics" },
    }),
    prisma.category.upsert({
      where: { slug: "dorm-essentials" },
      update: {},
      create: { name: "Dorm Essentials", slug: "dorm-essentials" },
    }),
    prisma.category.upsert({
      where: { slug: "stationery" },
      update: {},
      create: { name: "Stationery", slug: "stationery" },
    }),
  ]);

  // Better Auth keeps credentials on the Account row, not the User, so seed
  // users are created the same shape sign-up would produce.
  const password = await hashPassword("password123");
  const credentialIssuer = createLocalAccountIssuer("credential");

  async function upsertUser(
    name: string,
    email: string,
    role: "USER" | "ADMIN" = "USER"
  ) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { role },
      create: { name, email, role, emailVerified: true },
    });

    await prisma.account.upsert({
      where: { issuer_accountId: { issuer: credentialIssuer, accountId: user.id } },
      update: { password },
      create: {
        userId: user.id,
        providerId: "credential",
        issuer: credentialIssuer,
        accountId: user.id,
        password,
      },
    });

    return user;
  }

  await upsertUser("Admin", "admin@test.com", "ADMIN");
  const seller1 = await upsertUser("Asha Rai", "asha@test.com");
  const seller2 = await upsertUser("Bibek Shrestha", "bibek@test.com");

  await prisma.listing.createMany({
    data: [
      {
        sellerId: seller1.id,
        categoryId: books.id,
        title: "Calculus: Early Transcendentals (8th Ed)",
        description: "Barely used, no highlighting. Great condition.",
        pricePaisa: 150000,
        condition: "LIKE_NEW",
        images: [],
        campusCity: "Patan",
      },
      {
        sellerId: seller2.id,
        categoryId: electronics.id,
        title: "TI-84 Plus Graphing Calculator",
        description: "Works perfectly, includes charging cable.",
        pricePaisa: 350000,
        condition: "GOOD",
        images: [],
        campusCity: "Kathmandu",
      },
      {
        sellerId: seller1.id,
        categoryId: dorm.id,
        title: "Mini Fridge (3.2 cu ft)",
        description: "Moving out, must go this week.",
        pricePaisa: 800000,
        condition: "FAIR",
        images: [],
        campusCity: "Patan",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete. Demo login: asha@test.com / password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
