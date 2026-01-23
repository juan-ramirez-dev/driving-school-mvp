/**
 * Resources API Wrapper
 * Routes to mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import {
  getResources as getResourcesReal,
  getResourceById as getResourceByIdReal,
  createResource as createResourceReal,
  updateResource as updateResourceReal,
  deleteResource as deleteResourceReal,
  assignTeachersToResource as assignTeachersToResourceReal,
  selectResourceForClassType as selectResourceForClassTypeReal,
} from "../resources";
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

/**
 * GET /resources/{id}
 */
export async function getResourceById(
  id: string | number
): Promise<ApiResponse<Resource>> {
  if (isMockMode()) {
    return {
      success: false,
      message: "Resource not found",
      code: 404,
    };
  }
  return getResourceByIdReal(id);
}

/**
 * POST /resources
 */
export async function createResource(
  data: {
    name: string;
    type: "classroom" | "vehicle";
    plate?: string;
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    active?: boolean;
  }
): Promise<ApiResponse<Resource>> {
  if (isMockMode()) {
    return {
      success: false,
      message: "Mock mode: Cannot create resources",
      code: 400,
    };
  }
  return createResourceReal(data);
}

/**
 * PUT /resources/{id}
 */
export async function updateResource(
  id: string | number,
  data: Partial<{
    name: string;
    type: "classroom" | "vehicle";
    plate?: string;
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    active?: boolean;
  }>
): Promise<ApiResponse<Resource>> {
  if (isMockMode()) {
    return {
      success: false,
      message: "Mock mode: Cannot update resources",
      code: 400,
    };
  }
  return updateResourceReal(id, data);
}

/**
 * DELETE /resources/{id}
 */
export async function deleteResource(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  if (isMockMode()) {
    return {
      success: false,
      message: "Mock mode: Cannot delete resources",
      code: 400,
    };
  }
  return deleteResourceReal(id);
}

/**
 * POST /resources/{id}/teachers
 */
export async function assignTeachersToResource(
  id: string | number,
  teacherIds: number[]
): Promise<ApiResponse<{ message: string }>> {
  if (isMockMode()) {
    return {
      success: false,
      message: "Mock mode: Cannot assign teachers to resources",
      code: 400,
    };
  }
  return assignTeachersToResourceReal(id, teacherIds);
}
