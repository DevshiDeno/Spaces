interface EnvConfig {
  apiBaseUrl: string;
  appName: string;
  useMockApi: boolean;
}

export const env: EnvConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
  appName: import.meta.env.VITE_APP_NAME ?? 'Qreative Spaces',
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false',
};
