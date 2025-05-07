import { v4 as uuidv4 } from 'uuid';
import { pgAdapter } from './adapter';

async function seedIPhone() {
  console.log('Seeding iPhone product...');
  
  try {
    // اتصال به دیتابیس
    await pgAdapter.connect();
    
    // دریافت اطلاعات دسته‌بندی و برند
    const mobileCategory = await pgAdapter.findUnique('Category', { where: { id: 'mobile-category' } });
    const appleBrand = await pgAdapter.findUnique('Brand', { where: { id: 'apple-brand' } });
    
    // پیدا کردن فروشنده
    const sellers = await pgAdapter.findMany('Seller');
    const sellerShop = sellers.length > 0 ? sellers[0] : null;
    
    if (!sellerShop) {
      throw new Error('No sellers found. Please run the full seed script first.');
    }
    
    console.log('Retrieved references:');
    console.log('Mobile category ID:', mobileCategory?.id);
    console.log('Apple brand ID:', appleBrand?.id);
    console.log('Seller shop ID:', sellerShop?.id);
    
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
      
      // Add product image
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
      console.log('Created iPhone 13 image');
    } else {
      console.log('iPhone 13 product already exists');
    }
    
    console.log('iPhone 13 product seeded successfully!');
  } catch (error) {
    console.error('Error seeding iPhone product:', error);
  } finally {
    // قطع ارتباط با دیتابیس
    await pgAdapter.disconnect();
  }
}

seedIPhone();