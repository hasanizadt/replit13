-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "password" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'USER',
  "isVerified" BOOLEAN DEFAULT false,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Seller table
CREATE TABLE IF NOT EXISTS "Seller" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "shopName" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "logo" TEXT,
  "banner" TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "isVerified" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create Category table
CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "parentId" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL
);

-- Create Brand table
CREATE TABLE IF NOT EXISTS "Brand" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "logo" TEXT,
  "website" TEXT,
  "description" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Attribute table
CREATE TABLE IF NOT EXISTS "Attribute" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create AttributeValue table
CREATE TABLE IF NOT EXISTS "AttributeValue" (
  "id" TEXT PRIMARY KEY,
  "attributeId" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE
);

-- Create Product table
CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10, 2) NOT NULL,
  "compareAtPrice" DECIMAL(10, 2),
  "costPrice" DECIMAL(10, 2),
  "sku" TEXT,
  "inventory" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "categoryId" TEXT,
  "brandId" TEXT,
  "sellerId" TEXT NOT NULL,
  "stock" INTEGER DEFAULT 0,
  "quantity" INTEGER DEFAULT 0,
  "tax" DECIMAL(5, 2) DEFAULT 0,
  "taxUnit" TEXT DEFAULT 'percent',
  "discount" DECIMAL(5, 2) DEFAULT 0,
  "discountUnit" TEXT DEFAULT 'percent',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL,
  FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL,
  FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE
);

-- Create ProductImage table
CREATE TABLE IF NOT EXISTS "ProductImage" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

-- Create ProductVariant table
CREATE TABLE IF NOT EXISTS "ProductVariant" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sku" TEXT,
  "price" DECIMAL(10, 2) NOT NULL,
  "inventory" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

-- Create ProductAttribute table (many-to-many between Product and AttributeValue)
CREATE TABLE IF NOT EXISTS "ProductAttribute" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "attributeValueId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE,
  FOREIGN KEY ("attributeValueId") REFERENCES "AttributeValue"("id") ON DELETE CASCADE,
  UNIQUE ("productId", "attributeValueId")
);