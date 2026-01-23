/**
 * Teacher Resources API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as realApi from "../teacher-resources";
import { ApiResponse } from "../../utils/errorHandler";
import type {
  TeacherResource,
  CreateTeacherResourceData,
} from "../teacher-resources";

// Mock implementation
async function getTeacherResourcesMock(): Promise<ApiResponse<TeacherResource[]>> {
  return {
    success: true,
    data: [],
  };
}

async function getTeacherResourceByIdMock(
  id: string | number
): Promise<ApiResponse<TeacherResource>> {
  return {
    success: false,
    message: "Teacher resource not found",
    code: 404,
  };
}

async function createTeacherResourceMock(
  data: CreateTeacherResourceData
): Promise<ApiResponse<TeacherResource>> {
  return {
    success: false,
    message: "Mock mode: Cannot create teacher resources",
    code: 400,
  };
}

async function updateTeacherResourceMock(
  id: string | number,
  data: CreateTeacherResourceData
): Promise<ApiResponse<TeacherResource>> {
  return {
    success: false,
    message: "Mock mode: Cannot update teacher resources",
    code: 400,
  };
}

async function deleteTeacherResourceMock(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return {
    success: false,
    message: "Mock mode: Cannot delete teacher resources",
    code: 400,
  };
}

/**
 * GET /api/teacher-resources
 */
export async function getTeacherResources(): Promise<ApiResponse<TeacherResource[]>> {
  return isMockMode() 
    ? getTeacherResourcesMock() 
    : realApi.getTeacherResources();
}

/**
 * GET /api/teacher-resources/{id}
 */
export async function getTeacherResourceById(
  id: string | number
): Promise<ApiResponse<TeacherResource>> {
  return isMockMode() 
    ? getTeacherResourceByIdMock(id) 
    : realApi.getTeacherResourceById(id);
}

/**
 * POST /api/teacher-resources
 */
export async function createTeacherResource(
  data: CreateTeacherResourceData
): Promise<ApiResponse<TeacherResource>> {
  return isMockMode() 
    ? createTeacherResourceMock(data) 
    : realApi.createTeacherResource(data);
}

/**
 * PUT /api/teacher-resources/{id}
 */
export async function updateTeacherResource(
  id: string | number,
  data: CreateTeacherResourceData
): Promise<ApiResponse<TeacherResource>> {
  return isMockMode() 
    ? updateTeacherResourceMock(id, data) 
    : realApi.updateTeacherResource(id, data);
}

/**
 * DELETE /api/teacher-resources/{id}
 */
export async function deleteTeacherResource(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode() 
    ? deleteTeacherResourceMock(id) 
    : realApi.deleteTeacherResource(id);
}
