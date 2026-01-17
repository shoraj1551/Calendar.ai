// Environment variable validation
// Run this at application startup to ensure all required env vars are set

const requiredEnvVars = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'AUTH_GOOGLE_ID',
    'AUTH_GOOGLE_SECRET',
    'ENCRYPTION_KEY'
] as const;

export function validateEnv() {
    const missing: string[] = [];

    for (const key of requiredEnvVars) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables:\n${missing.join('\n')}\n\n` +
            `Please set these in your .env file or Vercel environment variables.`
        );
    }

    // Validate ENCRYPTION_KEY length
    if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
    }

    console.log('✓ All required environment variables are set');
}

// Auto-validate in non-test environments
if (process.env.NODE_ENV !== 'test') {
    validateEnv();
}
