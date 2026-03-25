import fs from 'fs';
import path from 'path';
import { getDb } from './connection.js';

export function migrate(): void {
  const db = getDb();
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('Database migrated successfully');
}

if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  migrate();
}
