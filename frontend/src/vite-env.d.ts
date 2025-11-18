/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  // Add more env vars here if needed later
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
