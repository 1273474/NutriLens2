import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/nutrilens';

// Create postgres connection
const client = postgres(connectionString);

// Create drizzle database instance
export const db = drizzle(client, { schema });

export default db; 