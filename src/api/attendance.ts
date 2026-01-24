/**
 * Real API Client for Teacher Classes and Attendance
 * Makes actual HTTP requests to backend endpoints
 */

import { apiGet, apiPost } from "./client";
import { ApiResponse } from "../utils/errorHandler";
import { getAppointmentById } from "./appointments";
import type {
  TeacherClassesResponse,
  UpdateAttendancePayload,
  UpdateAttendanceResponse,
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
 * Backend returns: { appointment_id, student_id, attended, notes?, penalty_applied }
 * 
 * Validates that student belongs to the appointment (backend also validates)
 */
export async function updateAttendance(
  payload: UpdateAttendancePayload
): Promise<ApiResponse<UpdateAttendanceResponse>> {
  // Validate that student belongs to appointment (client-side check for better UX)
  try {
    const appointmentResponse = await getAppointmentById(payload.appointment_id);
    if (appointmentResponse.success && appointmentResponse.data) {
      const appointment = appointmentResponse.data;
      if (appointment.student_id !== payload.student_id) {
        return {
          success: false,
          message: "El estudiante no pertenece a esta clase",
          code: 422,
        };
      }
    }
  } catch (error) {
    // If we can't validate, continue (backend will validate)
    console.warn("Could not validate student belongs to appointment:", error);
  }
  
  // Backend format: { appointment_id, student_id, attended: boolean, notes?: string }
  const response = await apiPost<any>("/teacher/classes/attendance", payload);
  
  if (response.success && response.data) {
    // Backend returns data with penalty_applied field
    return {
      ...response,
      data: response.data as UpdateAttendanceResponse,
    };
  }
  
  // Handle specific error messages
  if (!response.success) {
    if (response.message?.includes("no pertenece") || response.message?.includes("estudiante")) {
      return {
        ...response,
        message: "El estudiante no pertenece a esta clase",
      };
    }
  }
  
  return response as ApiResponse<UpdateAttendanceResponse>;
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
