import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users';

export async function seedSellers(prisma: PrismaClient) {
  console.log('Seeding sellers...');

  // First make sure users exist
  const { seller } = await seedUsers(prisma);
  
  // Define a unique ID for the seller
  const sellerId = `seller-${seller.id}`;
  
  // Create seller
  const sellerShop = await prisma.seller.upsert({
    where: { id: sellerId },
    update: {
      shopName: 'فروشگاه نمونه',
      phone: '02122334455',
      address: 'تهران، خیابان نمونه، پلاک ۱۲۳',
      userId: seller.id,
      logo: 'https://via.placeholder.com/150',
      banner: 'https://via.placeholder.com/1200x300',
      metaTitle: 'فروشگاه نمونه | خرید آنلاین',
      metaDescription: 'فروشگاه نمونه برای خرید محصولات با کیفیت',
      isVerified: true,
    },
    create: {
      id: sellerId,
      shopName: 'فروشگاه نمونه',
      phone: '02122334455',
      address: 'تهران، خیابان نمونه، پلاک ۱۲۳',
      userId: seller.id,
      logo: 'https://via.placeholder.com/150',
      banner: 'https://via.placeholder.com/1200x300',
      metaTitle: 'فروشگاه نمونه | خرید آنلاین',
      metaDescription: 'فروشگاه نمونه برای خرید محصولات با کیفیت',
      isVerified: true,
    },
  });
  
  console.log('Sellers seeded successfully!');
  console.log({ seller: sellerShop.id });
  
  return { sellerShop };
}