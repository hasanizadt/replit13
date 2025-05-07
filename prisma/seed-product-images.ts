import { v4 as uuidv4 } from 'uuid';
import { pgAdapter } from './adapter';

async function seedProductImages() {
  console.log('Seeding product images...');
  
  try {
    // اتصال به دیتابیس
    await pgAdapter.connect();
    
    // Samsung Galaxy S21
    const galaxyS21Id = 'samsung-galaxy-s21-product';
    
    // بررسی کنیم آیا محصول وجود دارد
    const product = await pgAdapter.findUnique('Product', { where: { id: galaxyS21Id } });
    
    if (!product) {
      console.log('Product not found.');
      return;
    }
    
    console.log('Found product:', product.name);
    
    // بررسی کنیم آیا تصاویر قبلاً ایجاد شده‌اند
    const existingImages = await pgAdapter.findMany('ProductImage', { where: { productId: galaxyS21Id } });
    
    if (existingImages.length > 0) {
      console.log(`Product already has ${existingImages.length} images.`);
    } else {
      // افزودن تصاویر محصول
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
      console.log('Created product image 1');
      
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
      console.log('Created product image 2');
    }
    
    console.log('Product images seeded successfully!');
  } catch (error) {
    console.error('Error seeding product images:', error);
  } finally {
    // قطع ارتباط با دیتابیس
    await pgAdapter.disconnect();
  }
}

seedProductImages();