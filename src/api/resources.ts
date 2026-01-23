/**
 * Real API Client for Resources
 * Handles requests to backend resources endpoints
 */

import { apiGet } from "./client";
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
