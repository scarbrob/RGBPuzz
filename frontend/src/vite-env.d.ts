/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AZURE_AD_CLIENT_ID: string
  readonly VITE_AZURE_AD_AUTHORITY: string
  readonly VITE_REDIRECT_URI: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_DISCORD_CLIENT_ID: string
  readonly VITE_FACEBOOK_CLIENT_ID: string
  readonly VITE_MICROSOFT_CLIENT_ID: string
  readonly VITE_APPLE_CLIENT_ID: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_BASE_URL_PROD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
