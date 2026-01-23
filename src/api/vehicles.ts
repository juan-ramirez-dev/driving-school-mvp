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
  const response = await apiGet<any[]>("/vehicles");
  
  if (response.success && response.data) {
    const { transformVehicles } = await import("../utils/responseTransformers");
    return {
      ...response,
      data: transformVehicles(response.data),
    };
  }
  
  return response as ApiResponse<Vehicle[]>;
}

/**
 * POST /vehicles
 * Creates a new vehicle
 * Backend expects: name, plate, brand, model, year, color
 */
export async function createVehicle(
  data: {
    name: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
  }
): Promise<ApiResponse<Vehicle>> {
  const response = await apiPost<any>("/vehicles", data);
  
  if (response.success && response.data) {
    const { transformVehicles } = await import("../utils/responseTransformers");
    // Transform single vehicle response
    const transformed = transformVehicles([response.data]);
    return {
      ...response,
      data: transformed[0],
    };
  }
  
  return response as ApiResponse<Vehicle>;
}

/**
 * PUT /vehicles/:id
 * Updates an existing vehicle
 * Backend expects: name, plate, brand, model, year, color
 */
export async function updateVehicle(
  id: string,
  data: Partial<{
    name: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    isActive: boolean;
  }>
): Promise<ApiResponse<Vehicle>> {
  const response = await apiPut<any>(`/vehicles/${id}`, data);
  
  if (response.success && response.data) {
    const { transformVehicles } = await import("../utils/responseTransformers");
    // Transform single vehicle response
    const transformed = transformVehicles([response.data]);
    return {
      ...response,
      data: transformed[0],
    };
  }
  
  return response as ApiResponse<Vehicle>;
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
