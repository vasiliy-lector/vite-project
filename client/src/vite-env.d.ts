/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL API (prefixed переменные Vite должны начинаться с VITE_) */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
