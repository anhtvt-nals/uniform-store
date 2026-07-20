import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

const MIGRATIONS_TABLE = 'schema_migrations';

async function ensureMigrationsTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id          SERIAL PRIMARY KEY,
      filename    TEXT NOT NULL UNIQUE,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedMigrations(client: Client): Promise<Set<string>> {
  const result = await client.query(`SELECT filename FROM ${MIGRATIONS_TABLE} ORDER BY id`);
  return new Set(result.rows.map(r => r.filename));
}

async function status(client: Client) {
  await ensureMigrationsTable(client);
  const applied = await getAppliedMigrations(client);
  const files = getMigrationFiles();

  console.log('\nMigration Status:');
  console.log('─'.repeat(60));

  let pending = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ✅  ${file}`);
    } else {
      console.log(`  ⏳  ${file}  (pending)`);
      pending++;
    }
  }

  console.log('─'.repeat(60));
  console.log(`  ${applied.size} applied, ${pending} pending`);
  console.log();
}

async function run(client: Client) {
  await ensureMigrationsTable(client);
  const applied = await getAppliedMigrations(client);
  const files = getMigrationFiles();

  const pending = files.filter(f => !applied.has(f));

  if (pending.length === 0) {
    console.log('\n✅ All migrations already applied. Nothing to do.\n');
    return;
  }

  console.log(`\n${pending.length} pending migration(s) to run:\n`);

  for (const file of pending) {
    const filePath = path.join(path.resolve(__dirname, '../migrations'), file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`  ▶ ${file}`);
    await client.query(sql);
    await client.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
      [file],
    );
    console.log(`  ✓ ${file} completed`);
  }

  console.log(`\n✅ ${pending.length} migration(s) applied successfully.\n`);
}

function getMigrationFiles(): string[] {
  const migrationsDir = path.resolve(__dirname, '../migrations');
  return fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
}

async function main() {
  const command = process.argv[2] || 'run';

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'uniform_store',
  });

  await client.connect();

  try {
    if (command === 'status') {
      await status(client);
    } else {
      await run(client);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
