import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
 
import EnvVars from '@src/constants/envVars';

const client = postgres(EnvVars.dbURL);

const _client = drizzle(client);
export default _client;