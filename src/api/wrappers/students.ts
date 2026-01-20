/**
 * Student API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as mockApi from "../../mocks/students";
import * as realApi from "../students";
import { ApiResponse } from "../../utils/errorHandler";
import { Student } from "../../mocks/types";

/**
 * GET /students
 */
export async function getStudents(): Promise<ApiResponse<Student[]>> {
  return isMockMode() ? mockApi.getStudents() : realApi.getStudents();
}

/**
 * POST /students
 */
export async function createStudent(
  data: Omit<Student, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<ApiResponse<Student>> {
  return isMockMode() ? mockApi.createStudent(data) : realApi.createStudent(data);
}

/**
 * PUT /students/:id
 */
export async function updateStudent(
  id: string,
  data: Partial<Omit<Student, "id" | "createdAt">>
): Promise<ApiResponse<Student>> {
  return isMockMode()
    ? mockApi.updateStudent(id, data)
    : realApi.updateStudent(id, data);
}

/**
 * DELETE /students/:id
 */
export async function deleteStudent(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode() ? mockApi.deleteStudent(id) : realApi.deleteStudent(id);
}
