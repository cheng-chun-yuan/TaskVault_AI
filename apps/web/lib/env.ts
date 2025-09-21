/**
 * Centralized configuration for environment variables
 * All environment variables should be accessed through this module
 */

interface EnvConfig {
  // Database
  database: {
    url: string;
  };
  
  // Blockchain
  blockchain: {
    privateKey: string;
  };
  
  // zkVerify
  zkVerify: {
    seedPhrase: string;
  };
  
  // App
  app: {
    nodeEnv: string;
    isProduction: boolean;
    isDevelopment: boolean;
    analyze: boolean;
  };
}

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value || defaultValue!;
}

function getOptionalEnvVar(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

export const env: EnvConfig = {
  database: {
    url: getOptionalEnvVar('DATABASE_URL', ''),
  },
  
  blockchain: {
    privateKey: getOptionalEnvVar('PRIVATE_KEY', ''),
  },
  
  zkVerify: {
    seedPhrase: getOptionalEnvVar('ZKVERIFY_SEED_PHRASE', ''),
  },
  
  app: {
    nodeEnv: getOptionalEnvVar('NODE_ENV', 'development'),
    isProduction: getOptionalEnvVar('NODE_ENV') === 'production',
    isDevelopment: getOptionalEnvVar('NODE_ENV') !== 'production',
    analyze: getOptionalEnvVar('ANALYZE') === 'true',
  },
};

// Export individual sections for convenience
export const { database, blockchain, zkVerify, app } = env;