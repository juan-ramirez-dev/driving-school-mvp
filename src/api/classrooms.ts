/**
 * Real API Client for Classroom Management
 * Makes actual HTTP requests to backend endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import { ApiResponse } from "../utils/errorHandler";
import { Classroom } from "../mocks/types";

/**
 * GET /classrooms
 * Returns a list of classrooms
 */
export async function getClassrooms(): Promise<ApiResponse<Classroom[]>> {
  return apiGet<Classroom[]>("/classrooms");
}

/**
 * POST /classrooms
 * Creates a new classroom
 */
export async function createClassroom(
  data: Omit<Classroom, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<ApiResponse<Classroom>> {
  return apiPost<Classroom>("/classrooms", data);
}

/**
 * PUT /classrooms/:id
 * Updates an existing classroom
 */
export async function updateClassroom(
  id: string,
  data: Partial<Omit<Classroom, "id" | "createdAt">>
): Promise<ApiResponse<Classroom>> {
  return apiPut<Classroom>(`/classrooms/${id}`, data);
}

/**
 * DELETE /classrooms/:id
 * Marks a classroom as inactive
 */
export async function deleteClassroom(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return apiDelete<{ message: string }>(`/classrooms/${id}`);
}
