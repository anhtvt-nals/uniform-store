import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  adminJwt: {
    secret: process.env.ADMIN_JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '8h',
  },
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT || process.env.S3_ENDPOINT || '',
    region: process.env.STORAGE_REGION || process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.STORAGE_ACCESS_KEY || process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || process.env.S3_SECRET_ACCESS_KEY || '',
    bucket: process.env.STORAGE_BUCKET || process.env.S3_BUCKET || 'uniform-store',
    publicUrl: process.env.STORAGE_PUBLIC_URL || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
}));
