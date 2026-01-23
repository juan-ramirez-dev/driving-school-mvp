/**
 * Attendance API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as mockApi from "../../mocks/attendance";
import * as realApi from "../attendance";
import { ApiResponse } from "../../utils/errorHandler";
import type {
  TeacherClassesResponse,
  UpdateAttendancePayload,
  CancelClassPayload,
} from "../../mocks/attendance";

/**
 * GET /teacher/classes
 */
export async function getTeacherClasses(
  date: string,
  teacherId?: string
): Promise<ApiResponse<TeacherClassesResponse>> {
  if (isMockMode()) {
    // Mock API requires teacherId
    if (!teacherId) {
      throw new Error("teacherId is required in mock mode");
    }
    return mockApi.getTeacherClasses(teacherId, date);
  } else {
    // Real API only needs date (uses authenticated user)
    return realApi.getTeacherClasses(date);
  }
}

/**
 * POST /teacher/classes/attendance
 */
export async function updateAttendance(
  payload: UpdateAttendancePayload
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode()
    ? mockApi.updateAttendance(payload)
    : realApi.updateAttendance(payload);
}

/**
 * POST /teacher/classes/cancel
 */
export async function cancelClass(
  payload: CancelClassPayload
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode()
    ? mockApi.cancelClass(payload)
    : realApi.cancelClass(payload);
}
