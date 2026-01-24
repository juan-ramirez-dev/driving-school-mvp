/**
 * Real API Client for Teacher Schedules
 * Makes actual HTTP requests to backend teacher schedule endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "./client";
import { ApiResponse } from "../utils/errorHandler";

export interface TeacherSchedule {
  id: number;
  user_id: number;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: string;
  end_time: string;
  slot_minutes: number;
  class_type_id?: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeacherScheduleData {
  user_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  class_type_id: number;
}

/**
 * GET /api/teacher-schedules
 * List teacher schedules (requires teacher_id query param)
 */
export async function getTeacherSchedules(
  teacherId: number
): Promise<ApiResponse<TeacherSchedule[]>> {
  return apiGet<TeacherSchedule[]>(`/teacher-schedules?teacher_id=${teacherId}`);
}

/**
 * POST /api/teacher-schedules
 * Create a new teacher schedule
 */
export async function createTeacherSchedule(
  data: CreateTeacherScheduleData
): Promise<ApiResponse<TeacherSchedule>> {
  return apiPost<TeacherSchedule>("/teacher-schedules", data);
}

/**
 * PUT /api/teacher-schedules/{id}
 * Update a teacher schedule
 */
export async function updateTeacherSchedule(
  id: string | number,
  data: Partial<CreateTeacherScheduleData & { active?: boolean }>
): Promise<ApiResponse<TeacherSchedule>> {
  return apiPut<TeacherSchedule>(`/teacher-schedules/${id}`, data);
}

/**
 * DELETE /api/teacher-schedules/{id}
 * Delete a teacher schedule
 */
export async function deleteTeacherSchedule(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return apiDelete<{ message: string }>(`/teacher-schedules/${id}`);
}

/**
 * PATCH /api/teacher-schedules/{id}/toggle
 * Toggle active/inactive status of a schedule
 */
export async function toggleTeacherSchedule(
  id: string | number
): Promise<ApiResponse<TeacherSchedule>> {
  return apiPatch<TeacherSchedule>(`/teacher-schedules/${id}/toggle`, {});
}
