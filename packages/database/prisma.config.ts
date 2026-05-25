import 'dotenv/config';

import { defineConfig } from 'prisma/config';

const defaultDatabaseUrl = 'postgresql://spotwave:changeme@localhost:5432/spotwave';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? defaultDatabaseUrl,
  },
});
