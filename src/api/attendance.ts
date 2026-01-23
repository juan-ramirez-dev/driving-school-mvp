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
 * GET /teacher/classes?date=:date
 * Returns theoretical and practical classes for authenticated teacher and date
 * Note: teacherId removed - backend uses authenticated user
 */
export async function getTeacherClasses(
  date: string
): Promise<ApiResponse<TeacherClassesResponse>> {
  const response = await apiGet<any[]>(
    `/teacher/classes?date=${date}`
  );
  
  if (response.success && response.data) {
    const { transformTeacherClasses } = await import("../utils/responseTransformers");
    return {
      ...response,
      data: transformTeacherClasses(response.data),
    };
  }
  
  return response as ApiResponse<TeacherClassesResponse>;
}

/**
 * POST /teacher/classes/attendance
 * Updates attendance status for a student in a class
 * Payload transformed: { classId, classType, studentId, status } -> { appointment_id, attended: boolean }
 */
export async function updateAttendance(
  payload: UpdateAttendancePayload
): Promise<ApiResponse<{ message: string }>> {
  // Payload is already in backend format: { appointment_id, attended: boolean }
  return apiPost<{ message: string }>("/teacher/classes/attendance", payload);
}

/**
 * POST /teacher/classes/cancel
 * Cancels a class (with optional justification)
 * Payload transformed: { classId, classType, teacherHasPermission, reason } -> { appointment_id, reason }
 */
export async function cancelClass(
  payload: CancelClassPayload
): Promise<ApiResponse<{ message: string }>> {
  // Ensure reason is always provided (use empty string if not)
  const backendPayload = {
    appointment_id: payload.appointment_id,
    reason: payload.reason || "",
  };
  return apiPost<{ message: string }>("/teacher/classes/cancel", backendPayload);
}
