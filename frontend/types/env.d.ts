declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_APP_NAME: string;
      EXPO_PUBLIC_APP_VERSION: string;
    }
  }
}

// Ensure this file is treated as a module
export {};