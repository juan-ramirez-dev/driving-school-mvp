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
  const response = await apiGet<any[]>("/students");
  
  if (response.success && response.data) {
    const { transformStudents } = await import("../utils/responseTransformers");
    return {
      ...response,
      data: transformStudents(response.data),
    };
  }
  
  return response as ApiResponse<Student[]>;
}

/**
 * POST /students
 * Creates a new student
 * Backend expects: name, last_name, email, number_phone, document, dateOfBirth, address
 */
export async function createStudent(
  data: {
    name: string;
    last_name: string;
    email: string;
    phone: string;
    document: string;
    dateOfBirth: string;
    address: string;
  }
): Promise<ApiResponse<Student>> {
  // Transform phone to number_phone for backend
  const backendData = {
    ...data,
    number_phone: data.phone,
  };
  delete (backendData as any).phone;
  
  const response = await apiPost<any>("/students", backendData);
  
  if (response.success && response.data) {
    const { transformStudents } = await import("../utils/responseTransformers");
    // Transform single student response
    const transformed = transformStudents([response.data]);
    return {
      ...response,
      data: transformed[0],
    };
  }
  
  return response as ApiResponse<Student>;
}

/**
 * PUT /students/:id
 * Updates an existing student
 * Backend expects: name, last_name, email, number_phone, document, dateOfBirth, address
 */
export async function updateStudent(
  id: string,
  data: Partial<{
    name: string;
    last_name: string;
    email: string;
    phone: string;
    document: string;
    dateOfBirth: string;
    address: string;
    isActive: boolean;
  }>
): Promise<ApiResponse<Student>> {
  // Transform phone to number_phone for backend
  const backendData: any = { ...data };
  if (data.phone !== undefined) {
    backendData.number_phone = data.phone;
    delete backendData.phone;
  }
  
  const response = await apiPut<any>(`/students/${id}`, backendData);
  
  if (response.success && response.data) {
    const { transformStudents } = await import("../utils/responseTransformers");
    // Transform single student response
    const transformed = transformStudents([response.data]);
    return {
      ...response,
      data: transformed[0],
    };
  }
  
  return response as ApiResponse<Student>;
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
