/**
 * Teacher API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as mockApi from "../../mocks/teachers";
import * as realApi from "../teachers";
import { ApiResponse } from "../../utils/errorHandler";
import { Teacher, TeacherAvailability } from "../../mocks/types";

/**
 * GET /teachers
 */
export async function getTeachers(): Promise<ApiResponse<Teacher[]>> {
  return isMockMode() ? mockApi.getTeachers() : realApi.getTeachers();
}

/**
 * POST /teachers
 */
export async function createTeacher(
  data: Omit<Teacher, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<ApiResponse<Teacher>> {
  return isMockMode() ? mockApi.createTeacher(data) : realApi.createTeacher(data);
}

/**
 * PUT /teachers/:id
 */
export async function updateTeacher(
  id: string,
  data: Partial<Omit<Teacher, "id" | "createdAt">>
): Promise<ApiResponse<Teacher>> {
  return isMockMode()
    ? mockApi.updateTeacher(id, data)
    : realApi.updateTeacher(id, data);
}

/**
 * DELETE /teachers/:id
 */
export async function deleteTeacher(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode() ? mockApi.deleteTeacher(id) : realApi.deleteTeacher(id);
}

/**
 * GET /teachers/availability
 */
export async function getTeacherAvailability(): Promise<
  ApiResponse<TeacherAvailability[]>
> {
  return isMockMode()
    ? mockApi.getTeacherAvailability()
    : realApi.getTeacherAvailability();
}

/**
 * POST /teachers/availability
 */
export async function setTeacherAvailability(
  data: Omit<TeacherAvailability, "availableSlots">
): Promise<ApiResponse<TeacherAvailability>> {
  return isMockMode()
    ? mockApi.setTeacherAvailability(data)
    : realApi.setTeacherAvailability(data);
}
