interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DEBUG: string;
  readonly VITE_APP_NAME?: string;
  // Add more env vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}