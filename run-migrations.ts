import './src/pre-start';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import envVars from './src/constants/envVars';

const migrationClient = postgres(envVars.dbURL);

async function applyMigration() {
    try {
        await migrate(drizzle(migrationClient), {
            migrationsFolder: './drizzle',
        });
        console.log('Migration applied successfully!');
    } catch (error) {
        console.error('Error applying migration:', error);
    } finally {
        await migrationClient.end();
    }
}

applyMigration();