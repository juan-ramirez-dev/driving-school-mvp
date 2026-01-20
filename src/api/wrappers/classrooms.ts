/**
 * Classroom API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as mockApi from "../../mocks/classrooms";
import * as realApi from "../classrooms";
import { ApiResponse } from "../../utils/errorHandler";
import { Classroom } from "../../mocks/types";

/**
 * GET /classrooms
 */
export async function getClassrooms(): Promise<ApiResponse<Classroom[]>> {
  return isMockMode() ? mockApi.getClassrooms() : realApi.getClassrooms();
}

/**
 * POST /classrooms
 */
export async function createClassroom(
  data: Omit<Classroom, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<ApiResponse<Classroom>> {
  return isMockMode()
    ? mockApi.createClassroom(data)
    : realApi.createClassroom(data);
}

/**
 * PUT /classrooms/:id
 */
export async function updateClassroom(
  id: string,
  data: Partial<Omit<Classroom, "id" | "createdAt">>
): Promise<ApiResponse<Classroom>> {
  return isMockMode()
    ? mockApi.updateClassroom(id, data)
    : realApi.updateClassroom(id, data);
}

/**
 * DELETE /classrooms/:id
 */
export async function deleteClassroom(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode()
    ? mockApi.deleteClassroom(id)
    : realApi.deleteClassroom(id);
}
