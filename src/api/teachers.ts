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
 * Note: Data extraction from nested structure is handled automatically in apiRequest
 */
export async function getTeachers(): Promise<ApiResponse<Teacher[]>> {
  return apiGet<Teacher[]>("/teachers");
}

/**
 * POST /teachers
 * Creates a new teacher
 * Backend expects: name, last_name, email, phone, document, licenseNumber
 */
export async function createTeacher(
  data: {
    name: string;
    last_name: string;
    email: string;
    phone: string;
    document: string;
    licenseNumber: string;
  }
): Promise<ApiResponse<Teacher>> {
  return apiPost<Teacher>("/teachers", data);
}

/**
 * PUT /teachers/:id
 * Updates an existing teacher
 * Backend expects: name, last_name, email, phone, document, licenseNumber
 */
export async function updateTeacher(
  id: string,
  data: Partial<{
    name: string;
    last_name: string;
    email: string;
    phone: string;
    document: string;
    licenseNumber: string;
    isActive: boolean;
  }>
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
