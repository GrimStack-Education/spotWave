import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './prisma/generated/prisma/client';

const defaultDatabaseUrl = 'postgresql://spotwave:changeme@localhost:5432/spotwave';
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? defaultDatabaseUrl,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from './prisma/generated/prisma/client';
