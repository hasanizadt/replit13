// This file is a wrapper for index.ts to maintain compatibility with existing scripts
// import './index';

import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users';
import { seedCategories } from './categories';
import { seedBrands } from './brands';
import { seedAttributes } from './attributes';
import { seedProducts } from './products';
import { seedSellers } from './sellers';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);
  
  // Seed in order to maintain referential integrity
  await seedUsers(prisma);
  await seedSellers(prisma);
  await seedCategories(prisma);
  await seedBrands(prisma);
  await seedAttributes(prisma);
  await seedProducts(prisma);
  
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });