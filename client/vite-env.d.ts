/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HCAPTCHA_SITEKEY: string;
  readonly VITE_PUBLIC_BUILDER_KEY: string;
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
