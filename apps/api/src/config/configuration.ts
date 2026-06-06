export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
  webAppUrl: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  bcryptRounds: number;
  logRequestBodies: boolean;
  platform: {
    commissionPercent: number;
  };
  mpesa: {
    consumerKey: string;
    consumerSecret: string;
    shortcode: string;
    passkey: string;
    callbackUrl: string;
    baseUrl: string;
    allowedIps: string[];
  };
  stripe: {
    secretKey: string;
  };
  mail: {
    resendApiKey: string;
    from: string;
    supportEmail: string;
  };
  r2: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    endpoint: string;
    publicBaseUrl: string;
  };
}

const DEV_JWT_SECRET = 'dev-only-secret';

function clampPercent(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

export const configuration = (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isProd = nodeEnv === 'production';

  const corsOrigins =
    process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? [];
  const jwtSecret = process.env.JWT_SECRET ?? DEV_JWT_SECRET;

  if (isProd) {
    if (corsOrigins.length === 0) {
      throw new Error(
        'CORS_ORIGINS must be set in production (comma-separated list of allowed web origins).'
      );
    }
    if (!process.env.JWT_SECRET || jwtSecret === DEV_JWT_SECRET) {
      throw new Error('JWT_SECRET must be set to a strong random value in production.');
    }
    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production.');
    }
    if (!process.env.WEB_APP_URL) {
      throw new Error('WEB_APP_URL must be set in production (used to build invite links).');
    }
  }

  return {
    nodeEnv,
    port: Number(process.env.PORT ?? 4000),
    apiPrefix: process.env.API_GLOBAL_PREFIX ?? 'api',
    corsOrigins,
    webAppUrl: process.env.WEB_APP_URL ?? 'http://localhost:5173',
    jwt: {
      secret: jwtSecret,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
    // Body logging is opt-out in dev, opt-in in prod (PII / token leak risk).
    logRequestBodies: isProd
      ? process.env.LOG_REQUEST_BODIES === 'true'
      : process.env.LOG_REQUEST_BODIES !== 'false',
    platform: {
      // Percentage the platform keeps from each customer payment (0-100).
      commissionPercent: clampPercent(
        Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 10)
      ),
    },
    mpesa: {
      consumerKey: process.env.MPESA_CONSUMER_KEY ?? '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET ?? '',
      shortcode: process.env.MPESA_SHORTCODE ?? '',
      passkey: process.env.MPESA_PASSKEY ?? '',
      callbackUrl: process.env.MPESA_CALLBACK_URL ?? '',
      baseUrl: process.env.MPESA_BASE_URL ?? 'https://sandbox.safaricom.co.ke',
      allowedIps:
        process.env.MPESA_ALLOWED_IPS?.split(',').map((s) => s.trim()).filter(Boolean) ?? [],
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    },
    mail: {
      resendApiKey: process.env.RESEND_API_KEY ?? '',
      from: process.env.MAIL_FROM ?? 'Qreative Spaces <onboarding@resend.dev>',
      supportEmail: process.env.SUPPORT_EMAIL ?? '',
    },
    r2: {
      accountId: process.env.R2_ACCOUNT_ID ?? '',
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
      bucket: process.env.R2_BUCKET ?? '',
      endpoint: process.env.R2_ENDPOINT ?? '',
      publicBaseUrl: process.env.R2_PUBLIC_BASE_URL ?? '',
    },
  };
};
