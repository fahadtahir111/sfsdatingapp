import { PrismaClient } from '@prisma/client';

// This is the recommended approach for instantiating Prisma Client in a Next.js environment.
// It prevents creating too many connections during development.

declare global {
  // allow global `var` declarations
  var prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing! Database connections will fail.");
}

const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma }; 