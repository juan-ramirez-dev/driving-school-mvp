/**
 * Real API Client for Teacher Classes and Attendance
 * Makes actual HTTP requests to backend endpoints
 */

import { apiGet, apiPost } from "./client";
import { ApiResponse } from "../utils/errorHandler";
import type {
  TeacherClassesResponse,
  UpdateAttendancePayload,
  CancelClassPayload,
} from "../mocks/attendance";

/**
 * GET /teacher/classes?teacherId=:id&date=:date
 * Returns theoretical and practical classes for a teacher and date
 */
export async function getTeacherClasses(
  teacherId: string,
  date: string
): Promise<ApiResponse<TeacherClassesResponse>> {
  return apiGet<TeacherClassesResponse>(
    `/teacher/classes?teacherId=${teacherId}&date=${date}`
  );
}

/**
 * POST /teacher/classes/attendance
 * Updates attendance status for a student in a class
 */
export async function updateAttendance(
  payload: UpdateAttendancePayload
): Promise<ApiResponse<{ message: string }>> {
  return apiPost<{ message: string }>("/teacher/classes/attendance", payload);
}

/**
 * POST /teacher/classes/cancel
 * Cancels a class (with optional justification)
 */
export async function cancelClass(
  payload: CancelClassPayload
): Promise<ApiResponse<{ message: string }>> {
  return apiPost<{ message: string }>("/teacher/classes/cancel", payload);
}
