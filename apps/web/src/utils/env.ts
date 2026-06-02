interface EnvConfig {
  apiBaseUrl: string;
  appName: string;
}

const apiBaseUrlRaw = import.meta.env.VITE_API_BASE_URL;
const isProdBuild = import.meta.env.PROD;

if (isProdBuild && !apiBaseUrlRaw) {
  throw new Error(
    'VITE_API_BASE_URL must be set when building for production. ' +
      'Set it on the host (e.g. Vercel/Netlify/Fly env vars) before `npm run build`.'
  );
}

export const env: EnvConfig = {
  apiBaseUrl: apiBaseUrlRaw ?? 'http://localhost:4000/api',
  appName: import.meta.env.VITE_APP_NAME ?? 'Qreative Spaces',
};
