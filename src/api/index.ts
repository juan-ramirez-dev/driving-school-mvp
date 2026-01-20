/**
 * Main API Module
 * Exports all API wrapper functions that automatically route to mock or real API
 * based on configuration flag
 * 
 * Usage:
 * ```typescript
 * import { getVehicles, createVehicle } from '@/api';
 * 
 * // Will use mock or real API based on NEXT_PUBLIC_API_MODE
 * const vehicles = await getVehicles();
 * ```
 */

// Export all wrapper functions
export * from "./wrappers/vehicles";
export * from "./wrappers/classrooms";
export * from "./wrappers/teachers";
export * from "./wrappers/students";
export * from "./wrappers/dashboard";
export * from "./wrappers/attendance";

// Export configuration utilities
export {
  getApiConfig,
  setApiConfig,
  isMockMode,
  isRealMode,
  getApiBaseUrl,
  type ApiMode,
  type ApiConfig,
} from "../config/api.config";
