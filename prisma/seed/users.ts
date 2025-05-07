import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  console.log('Seeding users...');
  
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'مدیر سیستم',
      password: hashedPassword,
      firstName: 'مدیر',
      lastName: 'سیستم',
      phone: '09123456789',
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
    },
  });
  
  // Create regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'کاربر عادی',
      password: hashedPassword,
      firstName: 'کاربر',
      lastName: 'عادی',
      phone: '09123456780',
      role: 'USER',
      isVerified: true,
      isActive: true,
    },
  });
  
  // Create seller user
  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      name: 'فروشنده نمونه',
      password: hashedPassword,
      firstName: 'فروشنده',
      lastName: 'نمونه',
      phone: '09123456781',
      role: 'SELLER',
      isVerified: true,
      isActive: true,
    },
  });
  
  console.log('Users seeded successfully!');
  console.log({ admin: admin.id, user: user.id, seller: seller.id });
  
  return { admin, user, seller };
}