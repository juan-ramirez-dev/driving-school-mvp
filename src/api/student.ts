/**
 * Real API Client for Student Dashboard
 * Makes actual HTTP requests to backend endpoints
 */

import { apiGet, apiPost } from "./client";
import { ApiResponse } from "../utils/errorHandler";
import type {
  AvailableSlot,
  StudentBooking,
  Fine,
  StudentDebt,
  BookClassPayload,
  CancelBookingPayload,
} from "../mocks/student";

/**
 * GET /student/available-slots?classType=:type
 * Returns available class slots for the next 2 weeks
 */
export async function getAvailableSlots(
  classType?: "theoretical" | "practical"
): Promise<ApiResponse<AvailableSlot[]>> {
  const endpoint = classType
    ? `/student/available-slots?classType=${classType}`
    : "/student/available-slots";
  return apiGet<AvailableSlot[]>(endpoint);
}

/**
 * POST /student/book-class
 * Books a class for a student
 */
export async function bookClass(
  payload: BookClassPayload
): Promise<ApiResponse<StudentBooking>> {
  return apiPost<StudentBooking>("/student/book-class", payload);
}

/**
 * GET /student/bookings?studentId=:id
 * Returns all bookings for a student
 */
export async function getStudentBookings(
  studentId: string
): Promise<ApiResponse<StudentBooking[]>> {
  return apiGet<StudentBooking[]>(`/student/bookings?studentId=${studentId}`);
}

/**
 * POST /student/cancel-booking
 * Cancels a student's booking
 */
export async function cancelBooking(
  payload: CancelBookingPayload
): Promise<ApiResponse<{ message: string }>> {
  return apiPost<{ message: string }>("/student/cancel-booking", payload);
}

/**
 * GET /student/fines?studentId=:id
 * Returns all fines for a student
 */
export async function getStudentFines(
  studentId: string
): Promise<ApiResponse<Fine[]>> {
  return apiGet<Fine[]>(`/student/fines?studentId=${studentId}`);
}

/**
 * GET /student/debt?studentId=:id
 * Returns total debt information for a student
 */
export async function getStudentDebt(
  studentId: string
): Promise<ApiResponse<StudentDebt>> {
  return apiGet<StudentDebt>(`/student/debt?studentId=${studentId}`);
}
