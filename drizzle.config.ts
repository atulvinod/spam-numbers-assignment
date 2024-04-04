import './src/pre-start';
import envVars from './src/constants/envVars';
import type {Config} from 'drizzle-kit'
export default {
    schema : ['./src/models'],
    out:'./drizzle',
    driver:'pg',
    dbCredentials: {
        connectionString: envVars.dbURL,
    },
} satisfies Config;