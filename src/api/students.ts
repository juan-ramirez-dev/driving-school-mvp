/**
 * Real API Client for Student Management
 * Makes actual HTTP requests to backend endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import { ApiResponse } from "../utils/errorHandler";
import { Student } from "../mocks/types";

/**
 * GET /students
 * Returns a list of students
 */
export async function getStudents(): Promise<ApiResponse<Student[]>> {
  return apiGet<Student[]>("/students");
}

/**
 * POST /students
 * Creates a new student
 */
export async function createStudent(
  data: Omit<Student, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<ApiResponse<Student>> {
  return apiPost<Student>("/students", data);
}

/**
 * PUT /students/:id
 * Updates an existing student
 */
export async function updateStudent(
  id: string,
  data: Partial<Omit<Student, "id" | "createdAt">>
): Promise<ApiResponse<Student>> {
  return apiPut<Student>(`/students/${id}`, data);
}

/**
 * DELETE /students/:id
 * Marks a student as inactive
 */
export async function deleteStudent(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return apiDelete<{ message: string }>(`/students/${id}`);
}
