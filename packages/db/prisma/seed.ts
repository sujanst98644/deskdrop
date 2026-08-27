import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Deskdrop...");

  const [books, electronics, dorm, stationery] = await Promise.all([
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

  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: { name: "Admin", email: "admin@test.com", hashedPassword: password, role: "ADMIN" },
  });

  const seller1 = await prisma.user.upsert({
    where: { email: "asha@test.com" },
    update: {},
    create: { name: "Asha Rai", email: "asha@test.com", hashedPassword: password },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: "bibek@test.com" },
    update: {},
    create: { name: "Bibek Shrestha", email: "bibek@test.com", hashedPassword: password },
  });

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
