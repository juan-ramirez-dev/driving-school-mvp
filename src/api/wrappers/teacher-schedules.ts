/**
 * Teacher Schedules API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as realApi from "../teacher-schedules";
import { ApiResponse } from "../../utils/errorHandler";
import type {
  TeacherSchedule,
  CreateTeacherScheduleData,
} from "../teacher-schedules";

// Mock implementation
async function getTeacherSchedulesMock(
  teacherId: number
): Promise<ApiResponse<TeacherSchedule[]>> {
  return {
    success: true,
    data: [],
  };
}

async function createTeacherScheduleMock(
  data: CreateTeacherScheduleData
): Promise<ApiResponse<TeacherSchedule>> {
  return {
    success: false,
    message: "Mock mode: Cannot create teacher schedules",
    code: 400,
  };
}

async function updateTeacherScheduleMock(
  id: string | number,
  data: Partial<CreateTeacherScheduleData & { active?: boolean }>
): Promise<ApiResponse<TeacherSchedule>> {
  return {
    success: false,
    message: "Mock mode: Cannot update teacher schedules",
    code: 400,
  };
}

async function deleteTeacherScheduleMock(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return {
    success: false,
    message: "Mock mode: Cannot delete teacher schedules",
    code: 400,
  };
}

async function toggleTeacherScheduleMock(
  id: string | number
): Promise<ApiResponse<TeacherSchedule>> {
  return {
    success: false,
    message: "Mock mode: Cannot toggle teacher schedules",
    code: 400,
  };
}

/**
 * GET /api/teacher-schedules
 */
export async function getTeacherSchedules(
  teacherId: number
): Promise<ApiResponse<TeacherSchedule[]>> {
  return isMockMode() 
    ? getTeacherSchedulesMock(teacherId) 
    : realApi.getTeacherSchedules(teacherId);
}

/**
 * POST /api/teacher-schedules
 */
export async function createTeacherSchedule(
  data: CreateTeacherScheduleData
): Promise<ApiResponse<TeacherSchedule>> {
  return isMockMode() 
    ? createTeacherScheduleMock(data) 
    : realApi.createTeacherSchedule(data);
}

/**
 * PUT /api/teacher-schedules/{id}
 */
export async function updateTeacherSchedule(
  id: string | number,
  data: Partial<CreateTeacherScheduleData & { active?: boolean }>
): Promise<ApiResponse<TeacherSchedule>> {
  return isMockMode() 
    ? updateTeacherScheduleMock(id, data) 
    : realApi.updateTeacherSchedule(id, data);
}

/**
 * DELETE /api/teacher-schedules/{id}
 */
export async function deleteTeacherSchedule(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode() 
    ? deleteTeacherScheduleMock(id) 
    : realApi.deleteTeacherSchedule(id);
}

/**
 * PATCH /api/teacher-schedules/{id}/toggle
 */
export async function toggleTeacherSchedule(
  id: string | number
): Promise<ApiResponse<TeacherSchedule>> {
  return isMockMode() 
    ? toggleTeacherScheduleMock(id) 
    : realApi.toggleTeacherSchedule(id);
}
