import { v4 as uuidv4 } from 'uuid';
import { pgAdapter } from './adapter';

async function seedProducts() {
  console.log('Seeding products...');
  
  try {
    // اتصال به دیتابیس
    await pgAdapter.connect();
    
    // دریافت اطلاعات دسته‌بندی‌ها، برندها و فروشندگان
    const mobileCategory = await pgAdapter.findUnique('Category', { where: { id: 'mobile-category' } });
    const menClothingCategory = await pgAdapter.findUnique('Category', { where: { id: 'men-clothing-category' } });
    
    const samsungBrand = await pgAdapter.findUnique('Brand', { where: { id: 'samsung-brand' } });
    const appleBrand = await pgAdapter.findUnique('Brand', { where: { id: 'apple-brand' } });
    const adidasBrand = await pgAdapter.findUnique('Brand', { where: { id: 'adidas-brand' } });
    
    // پیدا کردن فروشنده
    const sellers = await pgAdapter.findMany('Seller');
    const sellerShop = sellers.length > 0 ? sellers[0] : null;
    
    if (!sellerShop) {
      throw new Error('No sellers found. Please run the full seed script first.');
    }
    
    console.log('Retrieved references:');
    console.log('Mobile category ID:', mobileCategory?.id);
    console.log('Men clothing category ID:', menClothingCategory?.id);
    console.log('Samsung brand ID:', samsungBrand?.id);
    console.log('Apple brand ID:', appleBrand?.id);
    console.log('Adidas brand ID:', adidasBrand?.id);
    console.log('Seller shop ID:', sellerShop?.id);
    
    // Samsung Galaxy S21
    const galaxyS21Id = 'samsung-galaxy-s21-product';
    const galaxyS21 = await pgAdapter.findUnique('Product', { where: { id: galaxyS21Id } });
    
    if (!galaxyS21) {
      await pgAdapter.create('Product', {
        data: {
          id: galaxyS21Id,
          name: 'گوشی موبایل سامسونگ مدل Galaxy S21',
          slug: 'samsung-galaxy-s21',
          description: 'گوشی موبایل سامسونگ مدل Galaxy S21 دارای صفحه نمایش 6.2 اینچی و رزولوشن 1080x2400 پیکسل است. این گوشی مجهز به دوربین اصلی 64 مگاپیکسلی، باتری 4000 میلی‌آمپر ساعتی و پردازنده Exynos 2100 است.',
          price: 15000000,
          compareAtPrice: 17000000,
          costPrice: 12000000,
          sku: 'SAMS-S21-01',
          inventory: 50,
          isActive: true,
          categoryId: mobileCategory.id,
          brandId: samsungBrand.id,
          sellerId: sellerShop.id,
          stock: 50,
          quantity: 50,
          tax: 9,
          taxUnit: 'percent',
          discount: 10,
          discountUnit: 'percent'
        }
      });
      console.log(`Samsung Galaxy S21 product created with ID: ${galaxyS21Id}`);
      
      // Add product images
      const image1Id = uuidv4();
      await pgAdapter.create('ProductImage', {
        data: {
          id: image1Id,
          productId: galaxyS21Id,
          url: 'https://via.placeholder.com/500x500',
          alt: 'Samsung Galaxy S21 - Image 1',
          order: 1
        }
      });
      
      const image2Id = uuidv4();
      await pgAdapter.create('ProductImage', {
        data: {
          id: image2Id,
          productId: galaxyS21Id,
          url: 'https://via.placeholder.com/500x500',
          alt: 'Samsung Galaxy S21 - Image 2',
          order: 2
        }
      });
    } else {
      console.log('Samsung Galaxy S21 product already exists');
    }
    
    // iPhone 13
    const iPhone13Id = 'apple-iphone-13-product';
    const iPhone13 = await pgAdapter.findUnique('Product', { where: { id: iPhone13Id } });
    
    if (!iPhone13) {
      await pgAdapter.create('Product', {
        data: {
          id: iPhone13Id,
          name: 'گوشی موبایل اپل مدل iPhone 13',
          slug: 'apple-iphone-13',
          description: 'گوشی موبایل اپل مدل iPhone 13 دارای صفحه نمایش 6.1 اینچی Super Retina XDR و پردازنده A15 Bionic است. این گوشی دارای دوربین دوگانه 12 مگاپیکسلی و باتری با دوام است.',
          price: 25000000,
          compareAtPrice: 27000000,
          costPrice: 20000000,
          sku: 'APPL-IP13-01',
          inventory: 30,
          isActive: true,
          categoryId: mobileCategory.id,
          brandId: appleBrand.id,
          sellerId: sellerShop.id,
          stock: 30,
          quantity: 30,
          tax: 9,
          taxUnit: 'percent',
          discount: 5,
          discountUnit: 'percent'
        }
      });
      console.log(`iPhone 13 product created with ID: ${iPhone13Id}`);
      
      // Add product images
      const image1Id = uuidv4();
      await pgAdapter.create('ProductImage', {
        data: {
          id: image1Id,
          productId: iPhone13Id,
          url: 'https://via.placeholder.com/500x500',
          alt: 'Apple iPhone 13 - Image 1',
          order: 1
        }
      });
    } else {
      console.log('iPhone 13 product already exists');
    }
    
    // Adidas T-shirt
    const tshirtId = 'adidas-tshirt-product';
    const tshirt = await pgAdapter.findUnique('Product', { where: { id: tshirtId } });
    
    if (!tshirt) {
      await pgAdapter.create('Product', {
        data: {
          id: tshirtId,
          name: 'تی شرت مردانه آدیداس',
          slug: 'adidas-mens-tshirt',
          description: 'تی شرت مردانه آدیداس از جنس نخ پنبه با طراحی شیک و راحت برای ورزش و استفاده روزانه',
          price: 950000,
          compareAtPrice: 1200000,
          costPrice: 700000,
          sku: 'ADID-MTS-01',
          inventory: 100,
          isActive: true,
          categoryId: menClothingCategory.id,
          brandId: adidasBrand.id,
          sellerId: sellerShop.id,
          stock: 100,
          quantity: 100,
          tax: 9,
          taxUnit: 'percent',
          discount: 20,
          discountUnit: 'percent'
        }
      });
      console.log(`Adidas T-shirt product created with ID: ${tshirtId}`);
      
      // Add product image
      const image1Id = uuidv4();
      await pgAdapter.create('ProductImage', {
        data: {
          id: image1Id,
          productId: tshirtId,
          url: 'https://via.placeholder.com/500x500',
          alt: 'Adidas T-shirt - Image 1',
          order: 1
        }
      });
      
      // Add product variants
      const variant1Id = uuidv4();
      await pgAdapter.create('ProductVariant', {
        data: {
          id: variant1Id,
          productId: tshirtId,
          name: 'تی شرت مردانه آدیداس - سفید - سایز M',
          sku: 'ADID-MTS-01-WHT-M',
          price: 950000,
          inventory: 20
        }
      });
      
      const variant2Id = uuidv4();
      await pgAdapter.create('ProductVariant', {
        data: {
          id: variant2Id,
          productId: tshirtId,
          name: 'تی شرت مردانه آدیداس - سفید - سایز L',
          sku: 'ADID-MTS-01-WHT-L',
          price: 950000,
          inventory: 25
        }
      });
      
      const variant3Id = uuidv4();
      await pgAdapter.create('ProductVariant', {
        data: {
          id: variant3Id,
          productId: tshirtId,
          name: 'تی شرت مردانه آدیداس - مشکی - سایز M',
          sku: 'ADID-MTS-01-BLK-M',
          price: 950000,
          inventory: 30
        }
      });
    } else {
      console.log('Adidas T-shirt product already exists');
    }
    
    console.log('Products seeded successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    // قطع ارتباط با دیتابیس
    await pgAdapter.disconnect();
  }
}

seedProducts();