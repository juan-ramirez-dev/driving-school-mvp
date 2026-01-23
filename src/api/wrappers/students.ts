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
  if (isMockMode()) {
    // Transform backend format to mock format
    const mockData: Omit<Student, "id" | "createdAt" | "updatedAt" | "isActive"> = {
      name: `${data.name} ${data.last_name}`.trim(),
      email: data.email,
      phone: data.phone,
      legalId: data.document,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
    };
    return mockApi.createStudent(mockData);
  }
  return realApi.createStudent(data);
}

/**
 * PUT /students/:id
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
  if (isMockMode()) {
    // Transform backend format to mock format
    const mockData: Partial<Omit<Student, "id" | "createdAt">> = {};
    if (data.name !== undefined || data.last_name !== undefined) {
      const firstName = data.name || "";
      const lastName = data.last_name || "";
      mockData.name = `${firstName} ${lastName}`.trim();
    }
    if (data.email !== undefined) mockData.email = data.email;
    if (data.phone !== undefined) mockData.phone = data.phone;
    if (data.document !== undefined) mockData.legalId = data.document;
    if (data.dateOfBirth !== undefined) mockData.dateOfBirth = data.dateOfBirth;
    if (data.address !== undefined) mockData.address = data.address;
    if (data.isActive !== undefined) mockData.isActive = data.isActive;
    return mockApi.updateStudent(id, mockData);
  }
  return realApi.updateStudent(id, data);
}

/**
 * DELETE /students/:id
 */
export async function deleteStudent(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode() ? mockApi.deleteStudent(id) : realApi.deleteStudent(id);
}
