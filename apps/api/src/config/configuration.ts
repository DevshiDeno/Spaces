export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
  jwt: {
    secret: string;
    expiresIn: string;
  };
  bcryptRounds: number;
  mpesa: {
    consumerKey: string;
    consumerSecret: string;
    shortcode: string;
    passkey: string;
    callbackUrl: string;
    baseUrl: string;
  };
  stripe: {
    secretKey: string;
  };
}

export const configuration = (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  apiPrefix: process.env.API_GLOBAL_PREFIX ?? 'api',
  corsOrigins:
    process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? [],
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-only-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY ?? '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET ?? '',
    shortcode: process.env.MPESA_SHORTCODE ?? '',
    passkey: process.env.MPESA_PASSKEY ?? '',
    callbackUrl: process.env.MPESA_CALLBACK_URL ?? '',
    baseUrl: process.env.MPESA_BASE_URL ?? 'https://sandbox.safaricom.co.ke',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
  },
});
