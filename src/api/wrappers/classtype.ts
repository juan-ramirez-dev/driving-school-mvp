/**
 * Class Types API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as realApi from "../classtype";
import { ApiResponse } from "../../utils/errorHandler";
import type { ClassType, CreateClassTypeData } from "../classtype";

// Mock implementation
async function getClassTypesMock(): Promise<ApiResponse<ClassType[]>> {
  return {
    success: true,
    data: [
      {
        id: 1,
        name: "Teórica",
        requires_resource: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Práctica",
        requires_resource: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };
}

async function getClassTypeByIdMock(
  id: string | number
): Promise<ApiResponse<ClassType>> {
  const mockResponse = await getClassTypesMock();
  if (mockResponse.success && mockResponse.data) {
    const classType = mockResponse.data.find((ct) => ct.id === Number(id));
    if (classType) {
      return {
        success: true,
        data: classType,
      };
    }
  }
  return {
    success: false,
    message: "Class type not found",
    code: 404,
  };
}

async function createClassTypeMock(
  data: CreateClassTypeData
): Promise<ApiResponse<ClassType>> {
  return {
    success: false,
    message: "Mock mode: Cannot create class types",
    code: 400,
  };
}

async function updateClassTypeMock(
  id: string | number,
  data: Partial<CreateClassTypeData>
): Promise<ApiResponse<ClassType>> {
  return {
    success: false,
    message: "Mock mode: Cannot update class types",
    code: 400,
  };
}

async function deleteClassTypeMock(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return {
    success: false,
    message: "Mock mode: Cannot delete class types",
    code: 400,
  };
}

/**
 * GET /api/classtype
 */
export async function getClassTypes(): Promise<ApiResponse<ClassType[]>> {
  return isMockMode() ? getClassTypesMock() : realApi.getClassTypes();
}

/**
 * GET /api/classtype/{id}
 */
export async function getClassTypeById(
  id: string | number
): Promise<ApiResponse<ClassType>> {
  return isMockMode() 
    ? getClassTypeByIdMock(id) 
    : realApi.getClassTypeById(id);
}

/**
 * POST /api/classtype
 */
export async function createClassType(
  data: CreateClassTypeData
): Promise<ApiResponse<ClassType>> {
  return isMockMode() 
    ? createClassTypeMock(data) 
    : realApi.createClassType(data);
}

/**
 * PUT /api/classtype/{id}
 */
export async function updateClassType(
  id: string | number,
  data: Partial<CreateClassTypeData>
): Promise<ApiResponse<ClassType>> {
  return isMockMode() 
    ? updateClassTypeMock(id, data) 
    : realApi.updateClassType(id, data);
}

/**
 * DELETE /api/classtype/{id}
 */
export async function deleteClassType(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode() 
    ? deleteClassTypeMock(id) 
    : realApi.deleteClassType(id);
}
