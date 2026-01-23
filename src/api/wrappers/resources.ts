/**
 * Resources API Wrapper
 * Routes to mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import { getResources as getResourcesReal, selectResourceForClassType as selectResourceForClassTypeReal } from "../resources";
import type { Resource } from "../resources";
import type { ApiResponse } from "../../utils/errorHandler";

// Mock implementation - return empty array for now
// In a real scenario, you might want to add mock resources
async function getResourcesMock(
  type?: "classroom" | "vehicle"
): Promise<ApiResponse<Resource[]>> {
  // Return empty array - resources should come from backend
  return {
    success: true,
    data: [],
  };
}

async function selectResourceForClassTypeMock(
  class_type_id: number
): Promise<Resource | null> {
  return null;
}

/**
 * Get resources from backend or mock
 */
export async function getResources(
  type?: "classroom" | "vehicle"
): Promise<ApiResponse<Resource[]>> {
  if (isMockMode()) {
    return getResourcesMock(type);
  }
  return getResourcesReal(type);
}

/**
 * Select resource for class type from backend or mock
 */
export async function selectResourceForClassType(
  class_type_id: number
): Promise<Resource | null> {
  if (isMockMode()) {
    return selectResourceForClassTypeMock(class_type_id);
  }
  return selectResourceForClassTypeReal(class_type_id);
}
