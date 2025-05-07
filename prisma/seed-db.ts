import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { pgAdapter } from './adapter';

// خواندن فایل اسکیما SQL
const schemaSQL = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');

async function createTables() {
  try {
    // اتصال به دیتابیس
    await pgAdapter.connect();
    
    // اجرای دستورات SQL برای ایجاد جداول
    await pgAdapter.query(schemaSQL);
    
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
}

async function seedUsers() {
  console.log('Seeding users...');
  
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  // Admin user
  const adminId = uuidv4();
  const admin = await pgAdapter.findUnique('User', {
    where: { email: 'admin@example.com' }
  });
  
  if (!admin) {
    await pgAdapter.create('User', {
      data: {
        id: adminId,
        email: 'admin@example.com',
        name: 'مدیر سیستم',
        password: hashedPassword,
        firstName: 'مدیر',
        lastName: 'سیستم',
        phone: '09123456789',
        role: 'ADMIN',
        isVerified: true,
        isActive: true
      }
    });
    console.log(`Admin user created with ID: ${adminId}`);
  } else {
    console.log('Admin user already exists');
  }
  
  // Regular user
  const userId = uuidv4();
  const user = await pgAdapter.findUnique('User', {
    where: { email: 'user@example.com' }
  });
  
  if (!user) {
    await pgAdapter.create('User', {
      data: {
        id: userId,
        email: 'user@example.com',
        name: 'کاربر عادی',
        password: hashedPassword,
        firstName: 'کاربر',
        lastName: 'عادی',
        phone: '09123456780',
        role: 'USER',
        isVerified: true,
        isActive: true
      }
    });
    console.log(`Regular user created with ID: ${userId}`);
  } else {
    console.log('Regular user already exists');
  }
  
  // Seller user
  const sellerId = uuidv4();
  const seller = await pgAdapter.findUnique('User', {
    where: { email: 'seller@example.com' }
  });
  
  if (!seller) {
    await pgAdapter.create('User', {
      data: {
        id: sellerId,
        email: 'seller@example.com',
        name: 'فروشنده نمونه',
        password: hashedPassword,
        firstName: 'فروشنده',
        lastName: 'نمونه',
        phone: '09123456781',
        role: 'SELLER',
        isVerified: true,
        isActive: true
      }
    });
    console.log(`Seller user created with ID: ${sellerId}`);
  } else {
    console.log('Seller user already exists');
  }
  
  console.log('Users seeded successfully!');
  
  // Get users for reference in other seed functions
  const adminUser = await pgAdapter.findUnique('User', { where: { email: 'admin@example.com' } });
  const regularUser = await pgAdapter.findUnique('User', { where: { email: 'user@example.com' } });
  const sellerUser = await pgAdapter.findUnique('User', { where: { email: 'seller@example.com' } });
  
  return { admin: adminUser, user: regularUser, seller: sellerUser };
}

async function seedSellers(users: { seller: any }) {
  console.log('Seeding sellers...');
  
  const sellerId = `seller-${users.seller.id}`;
  const existingSeller = await pgAdapter.findUnique('Seller', { where: { id: sellerId } });
  
  if (!existingSeller) {
    await pgAdapter.create('Seller', {
      data: {
        id: sellerId,
        userId: users.seller.id,
        shopName: 'فروشگاه نمونه',
        phone: '02122334455',
        address: 'تهران، خیابان نمونه، پلاک ۱۲۳',
        logo: 'https://via.placeholder.com/150',
        banner: 'https://via.placeholder.com/1200x300',
        metaTitle: 'فروشگاه نمونه | خرید آنلاین',
        metaDescription: 'فروشگاه نمونه برای خرید محصولات با کیفیت',
        isVerified: true
      }
    });
    console.log(`Seller shop created with ID: ${sellerId}`);
  } else {
    console.log('Seller shop already exists');
  }
  
  const sellerShop = await pgAdapter.findUnique('Seller', { where: { id: sellerId } });
  
  console.log('Sellers seeded successfully!');
  return { sellerShop };
}

async function seedCategories() {
  console.log('Seeding categories...');
  
  // Electronics
  const electronicsId = 'electronics-category';
  const electronics = await pgAdapter.findUnique('Category', { where: { id: electronicsId } });
  
  if (!electronics) {
    await pgAdapter.create('Category', {
      data: {
        id: electronicsId,
        name: 'الکترونیک',
        slug: 'electronics',
        description: 'محصولات الکترونیکی شامل موبایل، لپ‌تاپ، تبلت و سایر گجت‌ها',
        isActive: true
      }
    });
    console.log(`Electronics category created with ID: ${electronicsId}`);
  } else {
    console.log('Electronics category already exists');
  }
  
  const electronicsCategory = await pgAdapter.findUnique('Category', { where: { id: electronicsId } });
  
  // Mobile
  const mobileId = 'mobile-category';
  const mobile = await pgAdapter.findUnique('Category', { where: { id: mobileId } });
  
  if (!mobile) {
    await pgAdapter.create('Category', {
      data: {
        id: mobileId,
        name: 'موبایل',
        slug: 'mobile',
        description: 'انواع گوشی‌های هوشمند',
        parentId: electronicsCategory.id,
        isActive: true
      }
    });
    console.log(`Mobile category created with ID: ${mobileId}`);
  } else {
    console.log('Mobile category already exists');
  }
  
  // Laptop
  const laptopId = 'laptop-category';
  const laptop = await pgAdapter.findUnique('Category', { where: { id: laptopId } });
  
  if (!laptop) {
    await pgAdapter.create('Category', {
      data: {
        id: laptopId,
        name: 'لپ تاپ',
        slug: 'laptop',
        description: 'انواع لپ تاپ و نوت بوک',
        parentId: electronicsCategory.id,
        isActive: true
      }
    });
    console.log(`Laptop category created with ID: ${laptopId}`);
  } else {
    console.log('Laptop category already exists');
  }
  
  // Fashion
  const fashionId = 'fashion-category';
  const fashion = await pgAdapter.findUnique('Category', { where: { id: fashionId } });
  
  if (!fashion) {
    await pgAdapter.create('Category', {
      data: {
        id: fashionId,
        name: 'مد و پوشاک',
        slug: 'fashion',
        description: 'انواع پوشاک مردانه، زنانه و بچگانه',
        isActive: true
      }
    });
    console.log(`Fashion category created with ID: ${fashionId}`);
  } else {
    console.log('Fashion category already exists');
  }
  
  const fashionCategory = await pgAdapter.findUnique('Category', { where: { id: fashionId } });
  
  // Men's Clothing
  const menClothingId = 'men-clothing-category';
  const menClothing = await pgAdapter.findUnique('Category', { where: { id: menClothingId } });
  
  if (!menClothing) {
    await pgAdapter.create('Category', {
      data: {
        id: menClothingId,
        name: 'پوشاک مردانه',
        slug: 'men-clothing',
        description: 'انواع پوشاک مردانه',
        parentId: fashionCategory.id,
        isActive: true
      }
    });
    console.log(`Men's Clothing category created with ID: ${menClothingId}`);
  } else {
    console.log('Men\'s Clothing category already exists');
  }
  
  // Women's Clothing
  const womenClothingId = 'women-clothing-category';
  const womenClothing = await pgAdapter.findUnique('Category', { where: { id: womenClothingId } });
  
  if (!womenClothing) {
    await pgAdapter.create('Category', {
      data: {
        id: womenClothingId,
        name: 'پوشاک زنانه',
        slug: 'women-clothing',
        description: 'انواع پوشاک زنانه',
        parentId: fashionCategory.id,
        isActive: true
      }
    });
    console.log(`Women's Clothing category created with ID: ${womenClothingId}`);
  } else {
    console.log('Women\'s Clothing category already exists');
  }
  
  console.log('Categories seeded successfully!');
  
  // Get categories for reference in other seed functions
  const mobileCategory = await pgAdapter.findUnique('Category', { where: { id: mobileId } });
  const laptopCategory = await pgAdapter.findUnique('Category', { where: { id: laptopId } });
  const menClothingCategory = await pgAdapter.findUnique('Category', { where: { id: menClothingId } });
  const womenClothingCategory = await pgAdapter.findUnique('Category', { where: { id: womenClothingId } });
  
  return {
    electronics: electronicsCategory,
    mobile: mobileCategory,
    laptop: laptopCategory,
    fashion: fashionCategory,
    menClothing: menClothingCategory,
    womenClothing: womenClothingCategory
  };
}

async function seedBrands() {
  console.log('Seeding brands...');
  
  // Samsung
  const samsungId = 'samsung-brand';
  const samsung = await pgAdapter.findUnique('Brand', { where: { id: samsungId } });
  
  if (!samsung) {
    await pgAdapter.create('Brand', {
      data: {
        id: samsungId,
        name: 'سامسونگ',
        slug: 'samsung',
        logo: 'https://via.placeholder.com/150',
        website: 'https://www.samsung.com',
        description: 'سامسونگ یکی از بزرگترین تولیدکنندگان محصولات الکترونیکی در جهان',
        isActive: true
      }
    });
    console.log(`Samsung brand created with ID: ${samsungId}`);
  } else {
    console.log('Samsung brand already exists');
  }
  
  // Apple
  const appleId = 'apple-brand';
  const apple = await pgAdapter.findUnique('Brand', { where: { id: appleId } });
  
  if (!apple) {
    await pgAdapter.create('Brand', {
      data: {
        id: appleId,
        name: 'اپل',
        slug: 'apple',
        logo: 'https://via.placeholder.com/150',
        website: 'https://www.apple.com',
        description: 'اپل تولیدکننده آیفون، آیپد، مک و سایر محصولات با کیفیت',
        isActive: true
      }
    });
    console.log(`Apple brand created with ID: ${appleId}`);
  } else {
    console.log('Apple brand already exists');
  }
  
  // Nike
  const nikeId = 'nike-brand';
  const nike = await pgAdapter.findUnique('Brand', { where: { id: nikeId } });
  
  if (!nike) {
    await pgAdapter.create('Brand', {
      data: {
        id: nikeId,
        name: 'نایک',
        slug: 'nike',
        logo: 'https://via.placeholder.com/150',
        website: 'https://www.nike.com',
        description: 'نایک تولیدکننده پوشاک و کفش ورزشی',
        isActive: true
      }
    });
    console.log(`Nike brand created with ID: ${nikeId}`);
  } else {
    console.log('Nike brand already exists');
  }
  
  // Adidas
  const adidasId = 'adidas-brand';
  const adidas = await pgAdapter.findUnique('Brand', { where: { id: adidasId } });
  
  if (!adidas) {
    await pgAdapter.create('Brand', {
      data: {
        id: adidasId,
        name: 'آدیداس',
        slug: 'adidas',
        logo: 'https://via.placeholder.com/150',
        website: 'https://www.adidas.com',
        description: 'آدیداس تولیدکننده پوشاک و کفش ورزشی',
        isActive: true
      }
    });
    console.log(`Adidas brand created with ID: ${adidasId}`);
  } else {
    console.log('Adidas brand already exists');
  }
  
  console.log('Brands seeded successfully!');
  
  // Get brands for reference in other seed functions
  const samsungBrand = await pgAdapter.findUnique('Brand', { where: { id: samsungId } });
  const appleBrand = await pgAdapter.findUnique('Brand', { where: { id: appleId } });
  const nikeBrand = await pgAdapter.findUnique('Brand', { where: { id: nikeId } });
  const adidasBrand = await pgAdapter.findUnique('Brand', { where: { id: adidasId } });
  
  return {
    samsung: samsungBrand,
    apple: appleBrand,
    nike: nikeBrand,
    adidas: adidasBrand
  };
}

async function seedAttributes() {
  console.log('Seeding attributes...');
  
  // Color attribute
  const colorId = 'color-attribute';
  const color = await pgAdapter.findUnique('Attribute', { where: { id: colorId } });
  
  if (!color) {
    await pgAdapter.create('Attribute', {
      data: {
        id: colorId,
        name: 'رنگ',
        isActive: true
      }
    });
    console.log(`Color attribute created with ID: ${colorId}`);
  } else {
    console.log('Color attribute already exists');
  }
  
  const colorAttribute = await pgAdapter.findUnique('Attribute', { where: { id: colorId } });
  
  // Color values
  const colorValues = [
    { value: 'سفید', attributeId: colorAttribute.id },
    { value: 'مشکی', attributeId: colorAttribute.id },
    { value: 'آبی', attributeId: colorAttribute.id },
    { value: 'قرمز', attributeId: colorAttribute.id }
  ];
  
  for (const colorValue of colorValues) {
    const colorValueId = `${colorAttribute.id}-${colorValue.value}`;
    const existingColorValue = await pgAdapter.findUnique('AttributeValue', { where: { id: colorValueId } });
    
    if (!existingColorValue) {
      await pgAdapter.create('AttributeValue', {
        data: {
          id: colorValueId,
          value: colorValue.value,
          attributeId: colorAttribute.id
        }
      });
      console.log(`Color value created: ${colorValue.value}`);
    } else {
      console.log(`Color value already exists: ${colorValue.value}`);
    }
  }
  
  // Size attribute
  const sizeId = 'size-attribute';
  const size = await pgAdapter.findUnique('Attribute', { where: { id: sizeId } });
  
  if (!size) {
    await pgAdapter.create('Attribute', {
      data: {
        id: sizeId,
        name: 'سایز',
        isActive: true
      }
    });
    console.log(`Size attribute created with ID: ${sizeId}`);
  } else {
    console.log('Size attribute already exists');
  }
  
  const sizeAttribute = await pgAdapter.findUnique('Attribute', { where: { id: sizeId } });
  
  // Size values
  const sizeValues = [
    { value: 'S', attributeId: sizeAttribute.id },
    { value: 'M', attributeId: sizeAttribute.id },
    { value: 'L', attributeId: sizeAttribute.id },
    { value: 'XL', attributeId: sizeAttribute.id }
  ];
  
  for (const sizeValue of sizeValues) {
    const sizeValueId = `${sizeAttribute.id}-${sizeValue.value}`;
    const existingSizeValue = await pgAdapter.findUnique('AttributeValue', { where: { id: sizeValueId } });
    
    if (!existingSizeValue) {
      await pgAdapter.create('AttributeValue', {
        data: {
          id: sizeValueId,
          value: sizeValue.value,
          attributeId: sizeAttribute.id
        }
      });
      console.log(`Size value created: ${sizeValue.value}`);
    } else {
      console.log(`Size value already exists: ${sizeValue.value}`);
    }
  }
  
  console.log('Attributes seeded successfully!');
  
  return {
    colorAttribute,
    sizeAttribute
  };
}

async function seedProducts(categories: any, brands: any, sellers: any) {
  console.log('Seeding products...');
  
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
        categoryId: categories.mobile.id,
        brandId: brands.samsung.id,
        sellerId: sellers.sellerShop.id,
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
        categoryId: categories.mobile.id,
        brandId: brands.apple.id,
        sellerId: sellers.sellerShop.id,
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
        categoryId: categories.menClothing.id,
        brandId: brands.adidas.id,
        sellerId: sellers.sellerShop.id,
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
}

async function main() {
  try {
    console.log(`Start seeding ...`);
    
    // Create tables
    await createTables();
    
    // Seed data
    const users = await seedUsers();
    const sellers = await seedSellers(users);
    const categories = await seedCategories();
    const brands = await seedBrands();
    const attributes = await seedAttributes();
    await seedProducts(categories, brands, sellers);
    
    console.log(`Seeding finished.`);
  } catch (error) {
    console.error(`Error during seeding:`, error);
  } finally {
    // Disconnect from the database
    await pgAdapter.disconnect();
  }
}

main();