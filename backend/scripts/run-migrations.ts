import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'uniform_store',
  });

  await client.connect();
  console.log('Connected to database');

  const migrationsDir = path.resolve(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`Running migration: ${file}`);
    try {
      await client.query(sql);
      console.log(`  ✓ ${file} completed`);
    } catch (err: any) {
      console.error(`  ✗ ${file} failed: ${err.message}`);
      throw err;
    }
  }

  await client.end();
  console.log('\nAll migrations completed successfully');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
