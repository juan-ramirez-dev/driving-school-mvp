/**
 * Real API Client for Class Types
 * Makes actual HTTP requests to backend class type endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import { ApiResponse } from "../utils/errorHandler";

export interface ClassType {
  id: number;
  name: string;
  requires_resource: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateClassTypeData {
  name: string;
  requires_resource?: boolean;
}

/**
 * GET /api/classtype
 * List all class types
 */
export async function getClassTypes(): Promise<ApiResponse<ClassType[]>> {
  return apiGet<ClassType[]>("/classtype");
}

/**
 * GET /api/classtype/{id}
 * Get class type by ID
 */
export async function getClassTypeById(
  id: string | number
): Promise<ApiResponse<ClassType>> {
  return apiGet<ClassType>(`/classtype/${id}`);
}

/**
 * POST /api/classtype
 * Create a new class type
 */
export async function createClassType(
  data: CreateClassTypeData
): Promise<ApiResponse<ClassType>> {
  return apiPost<ClassType>("/classtype", data);
}

/**
 * PUT /api/classtype/{id}
 * Update a class type
 */
export async function updateClassType(
  id: string | number,
  data: Partial<CreateClassTypeData>
): Promise<ApiResponse<ClassType>> {
  return apiPut<ClassType>(`/classtype/${id}`, data);
}

/**
 * DELETE /api/classtype/{id}
 * Delete a class type
 */
export async function deleteClassType(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return apiDelete<{ message: string }>(`/classtype/${id}`);
}
