/**
 * Vehicle API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as mockApi from "../../mocks/vehicles";
import * as realApi from "../vehicles";
import { ApiResponse } from "../../utils/errorHandler";
import { Vehicle } from "../../mocks/types";

/**
 * GET /vehicles
 */
export async function getVehicles(): Promise<ApiResponse<Vehicle[]>> {
  return isMockMode() ? mockApi.getVehicles() : realApi.getVehicles();
}

/**
 * POST /vehicles
 */
export async function createVehicle(
  data: Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<ApiResponse<Vehicle>> {
  return isMockMode() ? mockApi.createVehicle(data) : realApi.createVehicle(data);
}

/**
 * PUT /vehicles/:id
 */
export async function updateVehicle(
  id: string,
  data: Partial<Omit<Vehicle, "id" | "createdAt">>
): Promise<ApiResponse<Vehicle>> {
  return isMockMode()
    ? mockApi.updateVehicle(id, data)
    : realApi.updateVehicle(id, data);
}

/**
 * DELETE /vehicles/:id
 */
export async function deleteVehicle(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode() ? mockApi.deleteVehicle(id) : realApi.deleteVehicle(id);
}
