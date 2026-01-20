/**
 * Mock API for Admin Module
 * 
 * @deprecated Use '@/api' instead for automatic mock/real API switching
 * This module is kept for backward compatibility but will route to mock or real API
 * based on configuration. For direct mock access, use '@/mocks/vehicles', etc.
 * 
 * For new code, use:
 * ```typescript
 * import { getVehicles, createVehicle } from '@/api';
 * ```
 */

// Re-export from API wrappers (which handle mock/real switching)
export * from "../api";

/**
 * Admin Module Overview
 * 
 * This module provides access to all admin management features:
 * - Vehicle Management (CRUD)
 * - Classroom Management (CRUD)
 * - Teacher Management (CRUD + Availability)
 * - Student Management (CRUD with 1000 limit)
 * - Dashboard Statistics
 * 
 * All endpoints are accessible only to Administrators.
 * 
 * The API automatically switches between mock and real backend based on:
 * - Environment variable: NEXT_PUBLIC_API_MODE ("mock" | "real")
 * - Default: "mock"
 * 
 * Usage Example:
 * ```typescript
 * import { getVehicles, createVehicle } from '@/api';
 * 
 * const vehicles = await getVehicles();
 * if (vehicles.success) {
 *   console.log(vehicles.data);
 * }
 * ```
 */
