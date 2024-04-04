import db from '@src/lib/database';
import { sql } from 'drizzle-orm';

export async function performHealthCheck() {
  await db.execute(sql`SELECT 1+1`);
}
