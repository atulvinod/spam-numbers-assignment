/**
 * Environments variables declared here.
 */

/* eslint-disable node/no-process-env */


export default {
    nodeEnv: (process.env.NODE_ENV ?? ''),
    port: (process.env.PORT ?? 0),
    cookieProps: {
        key: 'ExpressGeneratorTs',
        secret: (process.env.COOKIE_SECRET ?? ''),
        // Casing to match express cookie options
        options: {
            httpOnly: true,
            signed: true,
            path: (process.env.COOKIE_PATH ?? ''),
            maxAge: Number(process.env.COOKIE_EXP ?? 0),
            domain: (process.env.COOKIE_DOMAIN ?? ''),
            secure: (process.env.SECURE_COOKIE === 'true'),
        },
    },
    jwt: {
        secret: (process.env.JWT_SECRET ??  ''),
        exp: (process.env.JWT_EXP ?? ''), // exp at the same time as the cookie
        issuer: (process.env.JWT_ISSUER ?? ''),
        audience: (process.env.JWT_AUDIENCE ?? ''),
    },
    dbURL : (process.env.DB_URL ?? ''),
} as const;
