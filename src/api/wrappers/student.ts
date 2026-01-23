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
} from "../../mocks/student";

/**
 * GET /student/available-slots
 */
export async function getAvailableSlots(
  classType?: "theoretical" | "practical"
): Promise<ApiResponse<AvailableSlot[]>> {
  return isMockMode()
    ? mockApi.getAvailableSlots(classType)
    : realApi.getAvailableSlots(classType);
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
): Promise<ApiResponse<{ message: string }>> {
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
