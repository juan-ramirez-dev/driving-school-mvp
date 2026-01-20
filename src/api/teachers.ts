/**
 * Real API Client for Teacher Management
 * Makes actual HTTP requests to backend endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import { ApiResponse } from "../utils/errorHandler";
import { Teacher, TeacherAvailability } from "../mocks/types";

/**
 * GET /teachers
 * Returns a list of teachers
 */
export async function getTeachers(): Promise<ApiResponse<Teacher[]>> {
  return apiGet<Teacher[]>("/teachers");
}

/**
 * POST /teachers
 * Creates a new teacher
 */
export async function createTeacher(
  data: Omit<Teacher, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<ApiResponse<Teacher>> {
  return apiPost<Teacher>("/teachers", data);
}

/**
 * PUT /teachers/:id
 * Updates an existing teacher
 */
export async function updateTeacher(
  id: string,
  data: Partial<Omit<Teacher, "id" | "createdAt">>
): Promise<ApiResponse<Teacher>> {
  return apiPut<Teacher>(`/teachers/${id}`, data);
}

/**
 * DELETE /teachers/:id
 * Marks a teacher as inactive
 */
export async function deleteTeacher(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return apiDelete<{ message: string }>(`/teachers/${id}`);
}

/**
 * GET /teachers/availability
 * Retrieves teacher availability data
 */
export async function getTeacherAvailability(): Promise<
  ApiResponse<TeacherAvailability[]>
> {
  return apiGet<TeacherAvailability[]>("/teachers/availability");
}

/**
 * POST /teachers/availability
 * Sets teacher availability by time blocks
 */
export async function setTeacherAvailability(
  data: Omit<TeacherAvailability, "availableSlots">
): Promise<ApiResponse<TeacherAvailability>> {
  return apiPost<TeacherAvailability>("/teachers/availability", data);
}
