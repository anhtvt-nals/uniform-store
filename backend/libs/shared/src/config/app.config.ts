import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  userJwt: {
    secret: process.env.USER_JWT_SECRET || process.env.JWT_SECRET || 'change-me-user-jwt',
    expiresIn: process.env.USER_JWT_EXPIRES_IN || '30d',
  },
  adminJwt: {
    secret: process.env.ADMIN_JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '8h',
  },
  storage: {
    endpoint:
      process.env.R2_ENDPOINT ||
      (process.env.R2_ACCOUNT_ID
        ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
        : ''),
    region: process.env.R2_REGION || 'auto',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucket: process.env.R2_BUCKET || 'uniform-store',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  mail: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.MAIL_FROM || 'noreply@minhanuniform.vn',
    notificationEmail: process.env.MAIL_NOTIFICATION_TO || 'minhan.uniform@gmail.com',
  },
}));
