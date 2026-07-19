import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const sslEnabled =
  process.env.DB_SSL === 'true' ||
  process.env.NODE_ENV === 'production' ||
  (process.env.DATABASE_URL?.includes('supabase.co') ?? false);

const baseConfig: any = {
  type: 'postgres',
  entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
};

if (process.env.DATABASE_URL) {
  baseConfig.url = process.env.DATABASE_URL;
} else {
  baseConfig.host = process.env.DB_HOST || 'localhost';
  baseConfig.port = parseInt(process.env.DB_PORT || '5432', 10);
  baseConfig.username = process.env.DB_USERNAME || 'postgres';
  baseConfig.password = process.env.DB_PASSWORD || 'postgres';
  baseConfig.database = process.env.DB_DATABASE || 'uniform_store';
}

export const AppDataSource = new DataSource(baseConfig);
