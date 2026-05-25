type EnvConfig = {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  CORS_ORIGIN?: string;
  NODE_ENV: string;
};

function parseRequiredString(
  value: unknown,
  envName: string,
  fallback = '',
): string {
  const normalized = typeof value === 'string' ? value.trim() : fallback;

  if (!normalized) {
    throw new Error(`${envName} is required`);
  }

  return normalized;
}

function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  return normalized || undefined;
}

function parsePort(value: string | undefined): number {
  const port = Number(value ?? '3000');

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be a valid TCP port');
  }

  return port;
}

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const databaseUrl = parseRequiredString(config.DATABASE_URL, 'DATABASE_URL');
  const jwtSecret = parseRequiredString(config.JWT_SECRET, 'JWT_SECRET');

  return {
    PORT: parsePort(config.PORT as string | undefined),
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    CORS_ORIGIN: parseOptionalString(config.CORS_ORIGIN),
    NODE_ENV: parseOptionalString(config.NODE_ENV) ?? 'development',
  };
}
