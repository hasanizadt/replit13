import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { seedBrands } from './brands';
import { seedCategories } from './categories';
import { seedSellers } from './sellers';

export async function seedProducts(prisma: PrismaClient) {
  console.log('Seeding products...');
  
  // Make sure related data exists
  const brands = await seedBrands(prisma);
  const categories = await seedCategories(prisma);
  const { sellerShop } = await seedSellers(prisma);
  
  // Mobile phone products
  const galaxyS21 = await prisma.product.upsert({
    where: { slug: 'samsung-galaxy-s21' },
    update: {},
    create: {
      name: 'گوشی موبایل سامسونگ مدل Galaxy S21',
      slug: 'samsung-galaxy-s21',
      description: 'گوشی موبایل سامسونگ مدل Galaxy S21 دارای صفحه نمایش 6.2 اینچی و رزولوشن 1080x2400 پیکسل است. این گوشی مجهز به دوربین اصلی 64 مگاپیکسلی، باتری 4000 میلی‌آمپر ساعتی و پردازنده Exynos 2100 است.',
      price: 15000000,
      compareAtPrice: 17000000,
      costPrice: 12000000,
      sku: 'SAMS-S21-01',
      inventory: 50,
      isActive: true,
      categoryId: categories.mobile.id,
      brandId: brands.samsung.id,
      sellerId: sellerShop.id,
      stock: 50,
      quantity: 50,
      tax: 9,
      taxUnit: 'percent',
      discount: 10,
      discountUnit: 'percent',
    },
  });

  // Create product images for Galaxy S21
  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      {
        url: 'https://via.placeholder.com/500x500',
        alt: 'Samsung Galaxy S21 - Image 1',
        order: 1,
        productId: galaxyS21.id,
      },
      {
        url: 'https://via.placeholder.com/500x500',
        alt: 'Samsung Galaxy S21 - Image 2',
        order: 2,
        productId: galaxyS21.id,
      },
    ],
  });

  // iPhone 13 product
  const iPhone13 = await prisma.product.upsert({
    where: { slug: 'apple-iphone-13' },
    update: {},
    create: {
      name: 'گوشی موبایل اپل مدل iPhone 13',
      slug: 'apple-iphone-13',
      description: 'گوشی موبایل اپل مدل iPhone 13 دارای صفحه نمایش 6.1 اینچی Super Retina XDR و پردازنده A15 Bionic است. این گوشی دارای دوربین دوگانه 12 مگاپیکسلی و باتری با دوام است.',
      price: 25000000,
      compareAtPrice: 27000000,
      costPrice: 20000000,
      sku: 'APPL-IP13-01',
      inventory: 30,
      isActive: true,
      categoryId: categories.mobile.id,
      brandId: brands.apple.id,
      sellerId: sellerShop.id,
      stock: 30,
      quantity: 30,
      tax: 9,
      taxUnit: 'percent',
      discount: 5,
      discountUnit: 'percent',
    },
  });

  // Create product images for iPhone 13
  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      {
        url: 'https://via.placeholder.com/500x500',
        alt: 'Apple iPhone 13 - Image 1',
        order: 1,
        productId: iPhone13.id,
      },
      {
        url: 'https://via.placeholder.com/500x500',
        alt: 'Apple iPhone 13 - Image 2',
        order: 2,
        productId: iPhone13.id,
      },
    ],
  });

  // MacBook Air
  const macbookAir = await prisma.product.upsert({
    where: { slug: 'apple-macbook-air-m1' },
    update: {},
    create: {
      name: 'لپ تاپ اپل مدل MacBook Air M1',
      slug: 'apple-macbook-air-m1',
      description: 'لپ تاپ اپل مدل MacBook Air M1 دارای پردازنده M1 و 8 گیگابایت رم است. این لپ تاپ دارای صفحه نمایش 13.3 اینچی با رزولوشن 2560x1600 پیکسل است.',
      price: 35000000,
      compareAtPrice: 38000000,
      costPrice: 30000000,
      sku: 'APPL-MBA-M1-01',
      inventory: 20,
      isActive: true,
      categoryId: categories.laptop.id,
      brandId: brands.apple.id,
      sellerId: sellerShop.id,
      stock: 20,
      quantity: 20,
      tax: 9,
      taxUnit: 'percent',
      discount: 8,
      discountUnit: 'percent',
    },
  });

  // Create product images for MacBook Air
  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      {
        url: 'https://via.placeholder.com/500x500',
        alt: 'Apple MacBook Air M1 - Image 1',
        order: 1,
        productId: macbookAir.id,
      },
      {
        url: 'https://via.placeholder.com/500x500',
        alt: 'Apple MacBook Air M1 - Image 2',
        order: 2,
        productId: macbookAir.id,
      },
    ],
  });

  // Adidas Men's T-shirt
  const adidasTShirt = await prisma.product.upsert({
    where: { slug: 'adidas-mens-tshirt' },
    update: {},
    create: {
      name: 'تی شرت مردانه آدیداس',
      slug: 'adidas-mens-tshirt',
      description: 'تی شرت مردانه آدیداس از جنس نخ پنبه با طراحی شیک و راحت برای ورزش و استفاده روزانه',
      price: 950000,
      compareAtPrice: 1200000,
      costPrice: 700000,
      sku: 'ADID-MTS-01',
      inventory: 100,
      isActive: true,
      categoryId: categories.menClothing.id,
      brandId: brands.adidas.id,
      sellerId: sellerShop.id,
      stock: 100,
      quantity: 100,
      tax: 9,
      taxUnit: 'percent',
      discount: 20,
      discountUnit: 'percent',
    },
  });

  // Create product images for Adidas T-shirt
  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      {
        url: 'https://via.placeholder.com/500x500',
        alt: 'Adidas Men T-shirt - Image 1',
        order: 1,
        productId: adidasTShirt.id,
      },
    ],
  });

  // Create product variants for Adidas T-shirt (different sizes and colors)
  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'تی شرت مردانه آدیداس - سفید - سایز M',
        sku: 'ADID-MTS-01-WHT-M',
        price: 950000,
        inventory: 20,
        productId: adidasTShirt.id,
      },
      {
        name: 'تی شرت مردانه آدیداس - سفید - سایز L',
        sku: 'ADID-MTS-01-WHT-L',
        price: 950000,
        inventory: 25,
        productId: adidasTShirt.id,
      },
      {
        name: 'تی شرت مردانه آدیداس - مشکی - سایز M',
        sku: 'ADID-MTS-01-BLK-M',
        price: 950000,
        inventory: 30,
        productId: adidasTShirt.id,
      },
      {
        name: 'تی شرت مردانه آدیداس - مشکی - سایز L',
        sku: 'ADID-MTS-01-BLK-L',
        price: 950000,
        inventory: 25,
        productId: adidasTShirt.id,
      },
    ],
  });

  // Nike Women's Running Shoes
  const nikeShoes = await prisma.product.upsert({
    where: { slug: 'nike-womens-running-shoes' },
    update: {},
    create: {
      name: 'کفش دویدن زنانه نایک',
      slug: 'nike-womens-running-shoes',
      description: 'کفش دویدن زنانه نایک با طراحی ارگونومیک و راحت برای دویدن و ورزش‌های روزانه',
      price: 2500000,
      compareAtPrice: 2800000,
      costPrice: 1800000,
      sku: 'NIKE-WRS-01',
      inventory: 80,
      isActive: true,
      categoryId: categories.womenClothing.id,
      brandId: brands.nike.id,
      sellerId: sellerShop.id,
      stock: 80,
      quantity: 80,
      tax: 9,
      taxUnit: 'percent',
      discount: 15,
      discountUnit: 'percent',
    },
  });

  // Create product images for Nike shoes
  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      {
        url: 'https://via.placeholder.com/500x500',
        alt: 'Nike Women Running Shoes - Image 1',
        order: 1,
        productId: nikeShoes.id,
      },
      {
        url: 'https://via.placeholder.com/500x500',
        alt: 'Nike Women Running Shoes - Image 2',
        order: 2,
        productId: nikeShoes.id,
      },
    ],
  });
  
  console.log('Products seeded successfully!');
  
  return {
    galaxyS21,
    iPhone13,
    macbookAir,
    adidasTShirt,
    nikeShoes,
  };
}