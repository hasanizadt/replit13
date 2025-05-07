/**
 * Extend the Prisma Client to add custom methods or models if needed.
 */
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaClient {
    // Add custom types or interfaces here
  }
}