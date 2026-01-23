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
  data: {
    name: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
  }
): Promise<ApiResponse<Vehicle>> {
  if (isMockMode()) {
    // Transform backend format to mock format
    const mockData: Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "isActive"> = {
      licensePlate: data.plate,
      brand: data.brand,
      model: data.model,
      year: data.year,
      color: data.color,
    };
    return mockApi.createVehicle(mockData);
  }
  return realApi.createVehicle(data);
}

/**
 * PUT /vehicles/:id
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
  if (isMockMode()) {
    // Transform backend format to mock format
    const mockData: Partial<Omit<Vehicle, "id" | "createdAt">> = {};
    if (data.plate !== undefined) mockData.licensePlate = data.plate;
    if (data.brand !== undefined) mockData.brand = data.brand;
    if (data.model !== undefined) mockData.model = data.model;
    if (data.year !== undefined) mockData.year = data.year;
    if (data.color !== undefined) mockData.color = data.color;
    if (data.isActive !== undefined) mockData.isActive = data.isActive;
    return mockApi.updateVehicle(id, mockData);
  }
  return realApi.updateVehicle(id, data);
}

/**
 * DELETE /vehicles/:id
 */
export async function deleteVehicle(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode() ? mockApi.deleteVehicle(id) : realApi.deleteVehicle(id);
}
