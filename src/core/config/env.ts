const defaultApiBaseUrl = 'http://localhost:3000/api/v1';

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || defaultApiBaseUrl,
  appName: import.meta.env.VITE_APP_NAME?.trim() || 'Sportify Admin',
};
