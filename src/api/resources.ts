/**
 * Real API Client for Resources
 * Handles requests to backend resources endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import { ApiResponse } from "../utils/errorHandler";

export interface Resource {
  id: number;
  name: string;
  type: "classroom" | "vehicle";
  plate?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ResourcesResponse {
  status: string;
  message: string;
  data: Resource[];
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * GET /resources
 * Get list of resources, optionally filtered by type
 */
export async function getResources(
  type?: "classroom" | "vehicle"
): Promise<ApiResponse<Resource[]>> {
  const endpoint = type ? `/resources?type=${type}` : "/resources";
  const response = await apiGet<Resource[]>(endpoint);
  
  // Data extraction is now handled automatically in apiRequest
  return response;
}

/**
 * GET /resources/{id}
 * Get resource by ID
 */
export async function getResourceById(
  id: string | number
): Promise<ApiResponse<Resource>> {
  return apiGet<Resource>(`/resources/${id}`);
}

/**
 * POST /resources
 * Create a new resource
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
  return apiPost<Resource>("/resources", data);
}

/**
 * PUT /resources/{id}
 * Update a resource
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
  return apiPut<Resource>(`/resources/${id}`, data);
}

/**
 * DELETE /resources/{id}
 * Deactivate a resource (sets active = false)
 */
export async function deleteResource(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return apiDelete<{ message: string }>(`/resources/${id}`);
}

/**
 * POST /resources/{id}/teachers
 * Assign teachers to a resource
 */
export async function assignTeachersToResource(
  id: string | number,
  teacherIds: number[]
): Promise<ApiResponse<{ message: string }>> {
  return apiPost<{ message: string }>(`/resources/${id}/teachers`, {
    teacher_ids: teacherIds,
  });
}

/**
 * Select appropriate resource for a class type
 * class_type_id: 1 = theoretical (needs classroom), 2 = practical (needs vehicle)
 */
export async function selectResourceForClassType(
  class_type_id: number
): Promise<Resource | null> {
  const resourceType = class_type_id === 1 ? "classroom" : "vehicle";
  const response = await getResources(resourceType);
  
  if (response.success && response.data && response.data.length > 0) {
    // Select first active resource
    const activeResource = response.data.find((r) => r.active);
    return activeResource || response.data[0];
  }
  
  return null;
}
