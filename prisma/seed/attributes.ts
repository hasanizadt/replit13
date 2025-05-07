import { PrismaClient } from '@prisma/client';

export async function seedAttributes(prisma: PrismaClient) {
  console.log('Seeding attributes...');
  
  // Create color attribute
  const colorAttribute = await prisma.attribute.upsert({
    where: { id: 'color-attribute' },
    update: {},
    create: {
      id: 'color-attribute',
      name: 'رنگ',
      isActive: true,
    },
  });

  // Create color values
  const colorValues = [
    { value: 'سفید', attributeId: colorAttribute.id },
    { value: 'مشکی', attributeId: colorAttribute.id },
    { value: 'آبی', attributeId: colorAttribute.id },
    { value: 'قرمز', attributeId: colorAttribute.id },
    { value: 'سبز', attributeId: colorAttribute.id },
    { value: 'زرد', attributeId: colorAttribute.id },
    { value: 'نقره‌ای', attributeId: colorAttribute.id },
    { value: 'طلایی', attributeId: colorAttribute.id },
  ];

  for (const colorData of colorValues) {
    await prisma.attributeValue.upsert({
      where: { 
        id: `${colorAttribute.id}-${colorData.value}` 
      },
      update: {},
      create: {
        id: `${colorAttribute.id}-${colorData.value}`,
        value: colorData.value,
        attributeId: colorAttribute.id,
      },
    });
  }

  // Create size attribute
  const sizeAttribute = await prisma.attribute.upsert({
    where: { id: 'size-attribute' },
    update: {},
    create: {
      id: 'size-attribute',
      name: 'سایز',
      isActive: true,
    },
  });

  // Create size values
  const sizeValues = [
    { value: 'XS', attributeId: sizeAttribute.id },
    { value: 'S', attributeId: sizeAttribute.id },
    { value: 'M', attributeId: sizeAttribute.id },
    { value: 'L', attributeId: sizeAttribute.id },
    { value: 'XL', attributeId: sizeAttribute.id },
    { value: 'XXL', attributeId: sizeAttribute.id },
  ];

  for (const sizeData of sizeValues) {
    await prisma.attributeValue.upsert({
      where: { 
        id: `${sizeAttribute.id}-${sizeData.value}` 
      },
      update: {},
      create: {
        id: `${sizeAttribute.id}-${sizeData.value}`,
        value: sizeData.value,
        attributeId: sizeAttribute.id,
      },
    });
  }

  // Create memory attribute (for electronics)
  const memoryAttribute = await prisma.attribute.upsert({
    where: { id: 'memory-attribute' },
    update: {},
    create: {
      id: 'memory-attribute',
      name: 'حافظه داخلی',
      isActive: true,
    },
  });

  // Create memory values
  const memoryValues = [
    { value: '64GB', attributeId: memoryAttribute.id },
    { value: '128GB', attributeId: memoryAttribute.id },
    { value: '256GB', attributeId: memoryAttribute.id },
    { value: '512GB', attributeId: memoryAttribute.id },
    { value: '1TB', attributeId: memoryAttribute.id },
  ];

  for (const memoryData of memoryValues) {
    await prisma.attributeValue.upsert({
      where: { 
        id: `${memoryAttribute.id}-${memoryData.value}` 
      },
      update: {},
      create: {
        id: `${memoryAttribute.id}-${memoryData.value}`,
        value: memoryData.value,
        attributeId: memoryAttribute.id,
      },
    });
  }
  
  console.log('Attributes seeded successfully!');
  
  return {
    colorAttribute,
    sizeAttribute,
    memoryAttribute,
  };
}