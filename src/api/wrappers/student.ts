/**
 * Student API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as mockApi from "../../mocks/student";
import * as realApi from "../student";
import { ApiResponse } from "../../utils/errorHandler";
import type {
  AvailableSlot,
  StudentBooking,
  Fine,
  StudentDebt,
  BookClassPayload,
  CancelBookingPayload,
  CancelBookingResponse,
} from "../../mocks/student";

/**
 * GET /student/available-slots
 * Supports filters: classType, date_from, date_to, teacher_id
 */
export async function getAvailableSlots(
  filters?: {
    classType?: "theoretical" | "practical";
    date_from?: string;
    date_to?: string;
    teacher_id?: number;
  }
): Promise<ApiResponse<AvailableSlot[]>> {
  if (isMockMode()) {
    // Mock API only supports classType filter for now
    return mockApi.getAvailableSlots(filters?.classType);
  }
  // Real API supports all filters
  return realApi.getAvailableSlots(filters);
}

/**
 * POST /student/book-class
 */
export async function bookClass(
  payload: BookClassPayload
): Promise<ApiResponse<StudentBooking>> {
  return isMockMode() ? mockApi.bookClass(payload) : realApi.bookClass(payload);
}

/**
 * GET /student/bookings
 * Note: studentId is the logged-in user's ID
 */
export async function getStudentBookings(
  studentId?: string
): Promise<ApiResponse<StudentBooking[]>> {
  return isMockMode()
    ? mockApi.getStudentBookings(studentId || "")
    : realApi.getStudentBookings(studentId);
}

/**
 * POST /student/cancel-booking
 */
export async function cancelBooking(
  payload: CancelBookingPayload
): Promise<ApiResponse<CancelBookingResponse>> {
  return isMockMode()
    ? mockApi.cancelBooking(payload)
    : realApi.cancelBooking(payload);
}

/**
 * GET /student/fines
 * Note: studentId is the logged-in user's ID
 */
export async function getStudentFines(
  studentId?: string
): Promise<ApiResponse<Fine[]>> {
  return isMockMode()
    ? mockApi.getStudentFines(studentId || "")
    : realApi.getStudentFines(studentId);
}

/**
 * GET /student/debt
 * Note: studentId is the logged-in user's ID
 */
export async function getStudentDebt(
  studentId?: string
): Promise<ApiResponse<StudentDebt>> {
  return isMockMode()
    ? mockApi.getStudentDebt(studentId || "")
    : realApi.getStudentDebt(studentId);
}
