/**
 * API Configuration
 * Controls whether to use mock data or real backend endpoints
 */

export type ApiMode = "mock" | "real";

export interface ApiConfig {
  mode: ApiMode;
  baseUrl?: string;
  apiKey?: string;
}

/**
 * Get API configuration from environment variables or defaults
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_API_MODE: "mock" | "real" (default: "mock")
 * - NEXT_PUBLIC_API_BASE_URL: Base URL for real API (default: "http://localhost:3001/api")
 * - NEXT_PUBLIC_API_KEY: Optional API key for authentication
 * 
 * You can also override programmatically:
 * ```typescript
 * import { setApiConfig } from '@/config/api.config';
 * setApiConfig({ mode: 'real', baseUrl: 'https://api.example.com' });
 * ```
 */
let apiConfig: ApiConfig = {
  mode: (process.env.NEXT_PUBLIC_API_MODE as ApiMode) || "mock",
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api",
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
};

/**
 * Get current API configuration
 */
export function getApiConfig(): ApiConfig {
  return { ...apiConfig };
}

/**
 * Set API configuration programmatically
 * Useful for runtime configuration changes
 */
export function setApiConfig(config: Partial<ApiConfig>): void {
  apiConfig = { ...apiConfig, ...config };
}

/**
 * Check if currently using mock mode
 */
export function isMockMode(): boolean {
  return apiConfig.mode === "mock";
}

/**
 * Check if currently using real API mode
 */
export function isRealMode(): boolean {
  return apiConfig.mode === "real";
}

/**
 * Get the base URL for API requests
 */
export function getApiBaseUrl(): string {
  return apiConfig.baseUrl || "http://localhost:3001/api";
}
