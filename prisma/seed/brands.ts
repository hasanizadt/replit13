import { PrismaClient } from '@prisma/client';

export async function seedBrands(prisma: PrismaClient) {
  console.log('Seeding brands...');
  
  // Create electronics brands
  
  // Samsung
  const samsung = await prisma.brand.upsert({
    where: { id: 'samsung-brand' },
    update: {},
    create: {
      id: 'samsung-brand',
      name: 'سامسونگ',
      slug: 'samsung',
      logo: 'https://via.placeholder.com/150',
      website: 'https://www.samsung.com',
      description: 'سامسونگ یکی از بزرگترین تولیدکنندگان محصولات الکترونیکی در جهان',
      isActive: true,
    },
  });
  
  // Apple
  const apple = await prisma.brand.upsert({
    where: { id: 'apple-brand' },
    update: {},
    create: {
      id: 'apple-brand',
      name: 'اپل',
      slug: 'apple',
      logo: 'https://via.placeholder.com/150',
      website: 'https://www.apple.com',
      description: 'اپل تولیدکننده آیفون، آیپد، مک و سایر محصولات با کیفیت',
      isActive: true,
    },
  });
  
  // Xiaomi
  const xiaomi = await prisma.brand.upsert({
    where: { id: 'xiaomi-brand' },
    update: {},
    create: {
      id: 'xiaomi-brand',
      name: 'شیائومی',
      slug: 'xiaomi',
      logo: 'https://via.placeholder.com/150',
      website: 'https://www.mi.com',
      description: 'شیائومی تولیدکننده محصولات الکترونیکی با قیمت مناسب',
      isActive: true,
    },
  });
  
  // Fashion brands
  
  // Nike
  const nike = await prisma.brand.upsert({
    where: { id: 'nike-brand' },
    update: {},
    create: {
      id: 'nike-brand',
      name: 'نایک',
      slug: 'nike',
      logo: 'https://via.placeholder.com/150',
      website: 'https://www.nike.com',
      description: 'نایک تولیدکننده پوشاک و کفش ورزشی',
      isActive: true,
    },
  });
  
  // Adidas
  const adidas = await prisma.brand.upsert({
    where: { id: 'adidas-brand' },
    update: {},
    create: {
      id: 'adidas-brand',
      name: 'آدیداس',
      slug: 'adidas',
      logo: 'https://via.placeholder.com/150',
      website: 'https://www.adidas.com',
      description: 'آدیداس تولیدکننده پوشاک و کفش ورزشی',
      isActive: true,
    },
  });
  
  // Zara
  const zara = await prisma.brand.upsert({
    where: { id: 'zara-brand' },
    update: {},
    create: {
      id: 'zara-brand',
      name: 'زارا',
      slug: 'zara',
      logo: 'https://via.placeholder.com/150',
      website: 'https://www.zara.com',
      description: 'زارا برند معروف پوشاک',
      isActive: true,
    },
  });
  
  // Home appliance brands
  
  // LG
  const lg = await prisma.brand.upsert({
    where: { id: 'lg-brand' },
    update: {},
    create: {
      id: 'lg-brand',
      name: 'ال جی',
      slug: 'lg',
      logo: 'https://via.placeholder.com/150',
      website: 'https://www.lg.com',
      description: 'ال جی تولیدکننده لوازم خانگی و محصولات الکترونیکی',
      isActive: true,
    },
  });
  
  // Bosch
  const bosch = await prisma.brand.upsert({
    where: { id: 'bosch-brand' },
    update: {},
    create: {
      id: 'bosch-brand',
      name: 'بوش',
      slug: 'bosch',
      logo: 'https://via.placeholder.com/150',
      website: 'https://www.bosch.com',
      description: 'بوش تولیدکننده لوازم خانگی با کیفیت',
      isActive: true,
    },
  });
  
  console.log('Brands seeded successfully!');
  
  return {
    samsung,
    apple,
    xiaomi,
    nike,
    adidas,
    zara,
    lg,
    bosch
  };
}