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
 * GET /teacher/classes?date=:date&teacher_id=:teacher_id
 * Returns theoretical and practical classes for a teacher and date
 * Note: teacher_id is required - should be the logged-in user's ID
 */
export async function getTeacherClasses(
  date: string,
  teacherId?: string
): Promise<ApiResponse<TeacherClassesResponse>> {
  // Get current user ID if teacherId not provided
  let currentTeacherId = teacherId;
  if (!currentTeacherId && typeof window !== "undefined") {
    const { getCurrentUser } = await import("../../lib/auth");
    const user = getCurrentUser();
    currentTeacherId = user?.id;
  }
  
  if (!currentTeacherId) {
    return {
      success: false,
      message: "Teacher ID is required",
      code: 400,
    };
  }
  
  // Build query string with date and teacher_id
  const params = new URLSearchParams({ 
    date,
    teacherId: currentTeacherId,
  });
  
  const response = await apiGet<any>(
    `/teacher/classes?${params.toString()}`
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
 * Backend expects: { appointment_id, student_id, attended: boolean, notes?: string }
 */
export async function updateAttendance(
  payload: UpdateAttendancePayload
): Promise<ApiResponse<{ message: string }>> {
  // Backend format: { appointment_id, student_id, attended: boolean, notes?: string }
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
