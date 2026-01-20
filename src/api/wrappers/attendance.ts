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
  teacherId: string,
  date: string
): Promise<ApiResponse<TeacherClassesResponse>> {
  return isMockMode()
    ? mockApi.getTeacherClasses(teacherId, date)
    : realApi.getTeacherClasses(teacherId, date);
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
