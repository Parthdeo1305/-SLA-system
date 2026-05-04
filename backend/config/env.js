/**
 * Validates required environment variables at startup.
 * Fails fast so we know immediately if config is wrong,
 * rather than discovering it during a production request.
 */
const REQUIRED_VARS = ['MONGO_URI', 'JWT_SECRET'];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `[Config] Missing required environment variables: ${missing.join(', ')}\n` +
        `Copy .env.example to .env and fill in the values.`
    );
    process.exit(1);
  }

  console.log('[Config] Environment variables validated ✓');
};

module.exports = validateEnv;
