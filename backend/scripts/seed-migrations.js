const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const TABLE = 'schema_migrations';
const migrationsDir = path.resolve(__dirname, '../migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

const c = new Client({
  host: 'localhost', port: 5432,
  user: 'postgres', password: 'postgres',
  database: 'uniform_store',
});

c.connect().then(async () => {
  await c.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id         SERIAL PRIMARY KEY,
      filename   TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  let count = 0;
  for (const file of files) {
    const res = await c.query(
      `INSERT INTO ${TABLE} (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
      [file]
    );
    if (res.rowCount > 0) count++;
  }

  const total = await c.query(`SELECT count(*) FROM ${TABLE}`);
  console.log(`✅ Added ${count} new. Total tracked: ${total.rows[0].count}`);
  console.log('All files marked as done:');
  const rows = await c.query(`SELECT filename, applied_at FROM ${TABLE} ORDER BY id`);
  rows.rows.forEach(r => console.log(`  ✅  ${r.filename}`));
  await c.end();
}).catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
