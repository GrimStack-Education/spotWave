type EnvConfig = {
  PORT: number;
  DATABASE_URL: string;
  CORS_ORIGIN?: string;
  NODE_ENV: string;
};

function parsePort(value: string | undefined): number {
  const port = Number(value ?? '3000');

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be a valid TCP port');
  }

  return port;
}

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const databaseUrl = String(config.DATABASE_URL ?? '').trim();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  return {
    PORT: parsePort(config.PORT as string | undefined),
    DATABASE_URL: databaseUrl,
    CORS_ORIGIN: config.CORS_ORIGIN
      ? String(config.CORS_ORIGIN).trim()
      : undefined,
    NODE_ENV: String(config.NODE_ENV ?? 'development'),
  };
}
