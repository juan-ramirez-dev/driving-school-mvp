/**
 * Real API Client for Teacher Resources
 * Makes actual HTTP requests to backend teacher-resource endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import { ApiResponse } from "../utils/errorHandler";

export interface TeacherResource {
  id: number;
  user_id: number;
  resource_id: number;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    document: string;
  };
  resource?: {
    id: number;
    name: string;
    type: "classroom" | "vehicle";
  };
}

export interface CreateTeacherResourceData {
  user_id: number;
  resource_id: number;
}

/**
 * GET /api/teacher-resources
 * List all teacher-resource assignments
 */
export async function getTeacherResources(): Promise<ApiResponse<TeacherResource[]>> {
  return apiGet<TeacherResource[]>("/teacher-resources");
}

/**
 * GET /api/teacher-resources/{id}
 * Get teacher-resource assignment by ID
 */
export async function getTeacherResourceById(
  id: string | number
): Promise<ApiResponse<TeacherResource>> {
  return apiGet<TeacherResource>(`/teacher-resources/${id}`);
}

/**
 * POST /api/teacher-resources
 * Create a new teacher-resource assignment
 */
export async function createTeacherResource(
  data: CreateTeacherResourceData
): Promise<ApiResponse<TeacherResource>> {
  return apiPost<TeacherResource>("/teacher-resources", data);
}

/**
 * PUT /api/teacher-resources/{id}
 * Update a teacher-resource assignment
 */
export async function updateTeacherResource(
  id: string | number,
  data: CreateTeacherResourceData
): Promise<ApiResponse<TeacherResource>> {
  return apiPut<TeacherResource>(`/teacher-resources/${id}`, data);
}

/**
 * DELETE /api/teacher-resources/{id}
 * Delete a teacher-resource assignment
 */
export async function deleteTeacherResource(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return apiDelete<{ message: string }>(`/teacher-resources/${id}`);
}
