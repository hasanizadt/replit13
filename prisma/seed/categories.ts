import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

export async function seedCategories(prisma: PrismaClient) {
  console.log('Seeding categories...');
  
  // Create main categories
  
  // Electronics
  const electronics = await prisma.category.upsert({
    where: { id: 'electronics-category' },
    update: {},
    create: {
      id: 'electronics-category',
      name: 'الکترونیک',
      slug: 'electronics',
      description: 'محصولات الکترونیکی شامل موبایل، لپ‌تاپ، تبلت و سایر گجت‌ها',
      isActive: true,
    },
  });
  
  // Mobile
  const mobile = await prisma.category.upsert({
    where: { id: 'mobile-category' },
    update: {},
    create: {
      id: 'mobile-category',
      name: 'موبایل',
      slug: 'mobile',
      description: 'انواع گوشی‌های هوشمند',
      isActive: true,
      parentId: electronics.id,
    },
  });
  
  // Laptop
  const laptop = await prisma.category.upsert({
    where: { id: 'laptop-category' },
    update: {},
    create: {
      id: 'laptop-category',
      name: 'لپ تاپ',
      slug: 'laptop',
      description: 'انواع لپ تاپ و نوت بوک',
      isActive: true,
      parentId: electronics.id,
    },
  });
  
  // Tablet
  const tablet = await prisma.category.upsert({
    where: { id: 'tablet-category' },
    update: {},
    create: {
      id: 'tablet-category',
      name: 'تبلت',
      slug: 'tablet',
      description: 'انواع تبلت',
      isActive: true,
      parentId: electronics.id,
    },
  });
  
  // Fashion
  const fashion = await prisma.category.upsert({
    where: { id: 'fashion-category' },
    update: {},
    create: {
      id: 'fashion-category',
      name: 'مد و پوشاک',
      slug: 'fashion',
      description: 'انواع پوشاک مردانه، زنانه و بچگانه',
      isActive: true,
    },
  });
  
  // Men's Clothing
  const menClothing = await prisma.category.upsert({
    where: { id: 'men-clothing-category' },
    update: {},
    create: {
      id: 'men-clothing-category',
      name: 'پوشاک مردانه',
      slug: 'men-clothing',
      description: 'انواع پوشاک مردانه',
      isActive: true,
      parentId: fashion.id,
    },
  });
  
  // Women's Clothing
  const womenClothing = await prisma.category.upsert({
    where: { id: 'women-clothing-category' },
    update: {},
    create: {
      id: 'women-clothing-category',
      name: 'پوشاک زنانه',
      slug: 'women-clothing',
      description: 'انواع پوشاک زنانه',
      isActive: true,
      parentId: fashion.id,
    },
  });
  
  // Kids' Clothing
  const kidsClothing = await prisma.category.upsert({
    where: { id: 'kids-clothing-category' },
    update: {},
    create: {
      id: 'kids-clothing-category',
      name: 'پوشاک بچگانه',
      slug: 'kids-clothing',
      description: 'انواع پوشاک بچگانه',
      isActive: true,
      parentId: fashion.id,
    },
  });
  
  // Home Appliances
  const homeAppliances = await prisma.category.upsert({
    where: { id: 'home-appliances-category' },
    update: {},
    create: {
      id: 'home-appliances-category',
      name: 'لوازم خانگی',
      slug: 'home-appliances',
      description: 'انواع لوازم خانگی',
      isActive: true,
    },
  });
  
  console.log('Categories seeded successfully!');
  
  return {
    electronics,
    mobile,
    laptop, 
    tablet,
    fashion,
    menClothing,
    womenClothing,
    kidsClothing,
    homeAppliances
  };
}