
const ENV = {
  dev: {
    apiUrl: 'http://192.168.1.5:5000',
    timeout: 15000,
  },
  staging: {
    apiUrl: 'https://staging-api.scilibrary.com',
    timeout: 15000,
  },
  prod: {
    apiUrl: 'https://api.scilibrary.com',
    timeout: 15000,
  },
};

// Determine current environment
const getEnvVars = () => {
  const isDev = __DEV__ !== false || process.env.NODE_ENV !== 'production';
  
  console.log('[Config] Environment:', isDev ? 'DEVELOPMENT' : 'PRODUCTION');
  console.log('[Config] API URL:', isDev ? ENV.dev.apiUrl : ENV.prod.apiUrl);
  
  if (isDev || !__DEV__) {
    return ENV.dev;
  }
  
  return ENV.prod;
};

const config = getEnvVars();

// Add network debugging
console.log('[Network Config]', {
  baseURL: config.apiUrl,
  timeout: config.timeout,
});

export default config;
