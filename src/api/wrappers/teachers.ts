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
  if (isMockMode()) {
    const mockResponse = await mockApi.getTeachers();
    return mockResponse;
  }
  return realApi.getTeachers();
}

/**
 * GET /teachers/{id}
 */
export async function getTeacherById(
  id: string | number
): Promise<ApiResponse<Teacher>> {
  if (isMockMode()) {
    // Try to find teacher in mock data
    const mockResponse = await mockApi.getTeachers();
    if (mockResponse.success && mockResponse.data) {
      const teacher = mockResponse.data.find((t) => t.id === String(id));
      if (teacher) {
        return {
          success: true,
          data: teacher,
        };
      }
    }
    return {
      success: false,
      message: "Teacher not found",
      code: 404,
    };
  }
  return realApi.getTeacherById(id);
}

/**
 * POST /teachers
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
  if (isMockMode()) {
    // Transform backend format to mock format
    const mockData: Omit<Teacher, "id" | "createdAt" | "updatedAt" | "isActive"> = {
      name: `${data.name} ${data.last_name}`.trim(),
      email: data.email,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
    };
    return mockApi.createTeacher(mockData);
  }
  return realApi.createTeacher(data);
}

/**
 * PUT /teachers/:id
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
  if (isMockMode()) {
    // Transform backend format to mock format
    const mockData: Partial<Omit<Teacher, "id" | "createdAt">> = {};
    if (data.name !== undefined || data.last_name !== undefined) {
      const firstName = data.name || "";
      const lastName = data.last_name || "";
      mockData.name = `${firstName} ${lastName}`.trim();
    }
    if (data.email !== undefined) mockData.email = data.email;
    if (data.phone !== undefined) mockData.phone = data.phone;
    if (data.licenseNumber !== undefined) mockData.licenseNumber = data.licenseNumber;
    if (data.isActive !== undefined) mockData.isActive = data.isActive;
    return mockApi.updateTeacher(id, mockData);
  }
  return realApi.updateTeacher(id, data);
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
