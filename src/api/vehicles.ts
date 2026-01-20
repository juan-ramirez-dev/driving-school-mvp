/**
 * Real API Client for Vehicle Management
 * Makes actual HTTP requests to backend endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import { ApiResponse } from "../utils/errorHandler";
import { Vehicle } from "../mocks/types";

/**
 * GET /vehicles
 * Returns a list of vehicles
 */
export async function getVehicles(): Promise<ApiResponse<Vehicle[]>> {
  return apiGet<Vehicle[]>("/vehicles");
}

/**
 * POST /vehicles
 * Creates a new vehicle
 */
export async function createVehicle(
  data: Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<ApiResponse<Vehicle>> {
  return apiPost<Vehicle>("/vehicles", data);
}

/**
 * PUT /vehicles/:id
 * Updates an existing vehicle
 */
export async function updateVehicle(
  id: string,
  data: Partial<Omit<Vehicle, "id" | "createdAt">>
): Promise<ApiResponse<Vehicle>> {
  return apiPut<Vehicle>(`/vehicles/${id}`, data);
}

/**
 * DELETE /vehicles/:id
 * Marks a vehicle as inactive
 */
export async function deleteVehicle(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return apiDelete<{ message: string }>(`/vehicles/${id}`);
}
