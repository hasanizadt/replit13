import { v4 as uuidv4 } from 'uuid';
import { pgAdapter } from './adapter';

async function seedOneProduct() {
  console.log('Seeding one product...');
  
  try {
    // اتصال به دیتابیس
    await pgAdapter.connect();
    
    // دریافت اطلاعات دسته‌بندی‌ها، برندها و فروشندگان
    const mobileCategory = await pgAdapter.findUnique('Category', { where: { id: 'mobile-category' } });
    const samsungBrand = await pgAdapter.findUnique('Brand', { where: { id: 'samsung-brand' } });
    
    // پیدا کردن فروشنده
    const sellers = await pgAdapter.findMany('Seller');
    const sellerShop = sellers.length > 0 ? sellers[0] : null;
    
    if (!sellerShop) {
      throw new Error('No sellers found. Please run the full seed script first.');
    }
    
    console.log('Retrieved references:');
    console.log('Mobile category ID:', mobileCategory?.id);
    console.log('Samsung brand ID:', samsungBrand?.id);
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
          description: 'گوشی موبایل سامسونگ مدل Galaxy S21 دارای صفحه نمایش 6.2 اینچی و رزولوشن 1080x2400 پیکسل است.',
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
      
      // Add one product image
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
      console.log('Product image created');
    } else {
      console.log('Samsung Galaxy S21 product already exists');
    }
    
    console.log('One product seeded successfully!');
  } catch (error) {
    console.error('Error seeding product:', error);
  } finally {
    // قطع ارتباط با دیتابیس
    await pgAdapter.disconnect();
  }
}

seedOneProduct();