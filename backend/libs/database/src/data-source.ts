import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const sslEnabled = process.env.DB_SSL === 'true';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Configure a Supabase PostgreSQL connection string.');
}

const baseConfig: any = {
  type: 'postgres',
  entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
};

baseConfig.url = process.env.DATABASE_URL;

export const AppDataSource = new DataSource(baseConfig);
