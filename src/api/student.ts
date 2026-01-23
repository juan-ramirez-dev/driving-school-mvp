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
 * GET /student/available-slots?class_type_id=:id
 * Returns available class slots for the next 2 weeks
 * class_type_id: 1 = theoretical, 2 = practical
 */
export async function getAvailableSlots(
  classType?: "theoretical" | "practical"
): Promise<ApiResponse<AvailableSlot[]>> {
  let endpoint = "/student/available-slots";
  if (classType) {
    const class_type_id = classType === "theoretical" ? 1 : 2;
    endpoint = `/student/available-slots?class_type_id=${class_type_id}`;
  }
  
  const response = await apiGet<any[]>(endpoint);
  
  if (response.success && response.data) {
    const { transformAvailableSlots } = await import("../utils/responseTransformers");
    return {
      ...response,
      data: transformAvailableSlots(response.data),
    };
  }
  
  return response as ApiResponse<AvailableSlot[]>;
}

/**
 * POST /student/book-class
 * Books a class for a student
 * Payload transformed from { studentId, slotId } to full structure
 */
export async function bookClass(
  payload: BookClassPayload
): Promise<ApiResponse<StudentBooking>> {
  // If payload doesn't have resource_id, fetch it
  let finalPayload = { ...payload };
  
  if (!finalPayload.resource_id) {
    const { selectResourceForClassType } = await import("./resources");
    const resource = await selectResourceForClassType(finalPayload.class_type_id);
    if (resource) {
      finalPayload.resource_id = resource.id;
    }
  }
  
  return apiPost<StudentBooking>("/student/book-class", finalPayload);
}

/**
 * GET /student/bookings
 * Returns all bookings for authenticated student
 * Note: studentId removed - backend uses authenticated user
 */
export async function getStudentBookings(): Promise<ApiResponse<StudentBooking[]>> {
  const response = await apiGet<any[]>("/student/bookings");
  
  if (response.success && response.data) {
    const { transformStudentBookings } = await import("../utils/responseTransformers");
    return {
      ...response,
      data: transformStudentBookings(response.data),
    };
  }
  
  return response as ApiResponse<StudentBooking[]>;
}

/**
 * POST /student/cancel-booking
 * Cancels a student's booking
 * Payload transformed: { studentId, bookingId } -> { appointment_id, reason }
 */
export async function cancelBooking(
  payload: CancelBookingPayload
): Promise<ApiResponse<{ message: string }>> {
  // Ensure reason is always provided (use empty string if not)
  const backendPayload = {
    appointment_id: payload.appointment_id,
    reason: payload.reason || "",
  };
  return apiPost<{ message: string }>("/student/cancel-booking", backendPayload);
}

/**
 * GET /student/fines
 * Returns all fines for authenticated student
 * Note: studentId removed - backend uses authenticated user
 */
export async function getStudentFines(): Promise<ApiResponse<Fine[]>> {
  const response = await apiGet<any>("/student/fines");
  
  if (response.success && response.data) {
    const { transformStudentFines } = await import("../utils/responseTransformers");
    return {
      ...response,
      data: transformStudentFines(response.data),
    };
  }
  
  return response as ApiResponse<Fine[]>;
}

/**
 * GET /student/debt
 * Returns total debt information for authenticated student
 * Note: studentId removed - backend uses authenticated user
 */
export async function getStudentDebt(): Promise<ApiResponse<StudentDebt>> {
  const response = await apiGet<any>("/student/debt");
  
  if (response.success && response.data) {
    const { transformStudentDebt, transformStudentFines } = await import("../utils/responseTransformers");
    // Get fines separately to include in debt response
    const finesResponse = await getStudentFines();
    const fines = finesResponse.success ? finesResponse.data : [];
    
    return {
      ...response,
      data: transformStudentDebt(response.data, fines),
    };
  }
  
  return response as ApiResponse<StudentDebt>;
}
