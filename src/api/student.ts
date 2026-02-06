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
  CancelBookingResponse,
} from "../mocks/student";

/**
 * GET /api/student/available-slots
 * Returns available class slots for students
 * 
 * Query Parameters (all optional):
 * - classType: "theoretical" | "practical" (string, not class_type_id)
 * - date_from: YYYY-MM-DD
 * - date_to: YYYY-MM-DD
 * - teacher_id: number
 * 
 * Response structure:
 * {
 *   "data": {
 *     "slots": [...],
 *     "teachers": {...},
 *     "resources": {...},
 *     "classTypes": {...}
 *   }
 * }
 */
export async function getAvailableSlots(filters?: {
  classType?: "theoretical" | "practical";
  date_from?: string;
  date_to?: string;
  teacher_id?: number;
}): Promise<ApiResponse<AvailableSlot[]>> {
  const params = new URLSearchParams();
  
  if (filters?.classType) {
    params.append("classType", filters.classType);
  }
  if (filters?.date_from) {
    params.append("date_from", filters.date_from);
  }
  if (filters?.date_to) {
    params.append("date_to", filters.date_to);
  }
  if (filters?.teacher_id) {
    params.append("teacher_id", String(filters.teacher_id));
  }
  
  const endpoint = params.toString() 
    ? `/student/available-slots?${params.toString()}`
    : "/student/available-slots";
  
  const response = await apiGet<any>(endpoint);


  if (response.success && response.data) {
    const { transformAvailableSlots } = require("../utils/responseTransformers");
    // Backend returns nested structure: { slots: [], teachers: {}, resources: {}, classTypes: {} }
    const transformed = transformAvailableSlots(response.data);

    return {
      ...response,
      data: transformed,
    };
  }
  
  return response as ApiResponse<AvailableSlot[]>;
}

/**
 * POST /student/book-class
 * Books a class for a student
 * Payload transformed from { studentId, slotId } to full structure
 * Includes client-side validation for debt and no-show limit (UX improvement)
 */
export async function bookClass(
  payload: BookClassPayload
): Promise<ApiResponse<StudentBooking>> {
  // Get current user ID for validation
  let studentId: string | undefined;
  if (typeof window !== "undefined") {
    const { getCurrentUser } = await import("../../lib/auth");
    const user = getCurrentUser();
    studentId = user?.id;
  }
  
  // Client-side validation for better UX (backend will also validate)
  if (studentId) {
    const { canStudentBook } = await import("../utils/businessRules");
    const validation = await canStudentBook(studentId);
    if (!validation.canBook) {
      return {
        success: false,
        message: validation.reason || "No puede reservar clases en este momento",
        code: 422,
      };
    }
  }
  
  // Validate resource requirement
  if (payload.class_type_id) {
    const { getClassTypeById } = await import("./classtype");
    const classTypeResponse = await getClassTypeById(payload.class_type_id);
    if (classTypeResponse.success && classTypeResponse.data) {
      const { validateResourceRequirement } = await import("../utils/businessRules");
      const resourceValidation = validateResourceRequirement(
        classTypeResponse.data,
        payload.resource_id
      );
      if (!resourceValidation.valid) {
        return {
          success: false,
          message: resourceValidation.error || "Este tipo de clase requiere un recurso",
          code: 422,
        };
      }
    }
  }
  
  // Get current user ID (student_id) - backend requires it
  let currentStudentId: number | undefined;
  if (typeof window !== "undefined") {
    const { getCurrentUser } = await import("../../lib/auth");
    const user = getCurrentUser();
    currentStudentId = user ? parseInt(user.id) : undefined;
  }
  
  if (!currentStudentId) {
    return {
      success: false,
      message: "Student ID is required",
      code: 400,
    };
  }
  
  // If payload doesn't have resource_id, fetch it
  let finalPayload: any = { ...payload };
  
  // Add student_id to payload (required by backend)
  finalPayload.student_id = currentStudentId;
  
  if (!finalPayload.resource_id) {
    const { selectResourceForClassType } = await import("./resources");
    const resource = await selectResourceForClassType(finalPayload.class_type_id);
    if (resource) {
      finalPayload.resource_id = resource.id;
    }
  }
  
  const response = await apiPost<any>("/student/book-class", finalPayload);
  
  // Surface backend business-rule messages (422) so UI shows exact reason
  if (!response.success && response.message) {
    // Normalize key messages to match API contract wording (backend message is already used by errorHandler)
    if (response.message.includes("límite de inasistencias") || response.message.includes("inasistencias"))
      return { ...response, message: "Ha superado el límite de inasistencias. No puede reservar nuevas clases." };
    if (response.message.includes("requiere un recurso"))
      return { ...response, message: "Este tipo de clase requiere un recurso" };
    if (response.message.includes("bloqueo") || response.message.includes("mantenimiento"))
      return { ...response, message: "El recurso no está disponible en ese horario (bloqueo o mantenimiento)." };
    if (response.message.includes("ocupado") && !response.message.includes("bloqueo"))
      return { ...response, message: "El recurso ya está ocupado en ese horario" };
    if (response.message.includes("Ya tiene agendada") || response.message.includes("mismo espacio"))
      return { ...response, message: "Ya tiene agendada una clase de este tipo en ese horario. No puede reservar dos veces el mismo espacio." };
    // Periodo de acceso, máximo de horas, etc.: backend message is already in response.message
  }
  
  if (response.success && response.data) {
    const { transformStudentBookings } = await import("../utils/responseTransformers");
    // Transform single booking (wrap in array, transform, then get first)
    const transformed = transformStudentBookings([response.data]);
    return {
      ...response,
      data: transformed[0],
    };
  }
  
  return response as ApiResponse<StudentBooking>;
}

/**
 * GET /student/bookings?student_id=:student_id
 * Returns all bookings for a student
 * Note: studentId is the logged-in user's ID
 */
export async function getStudentBookings(
  studentId?: string
): Promise<ApiResponse<StudentBooking[]>> {
  // Get current user ID if studentId not provided
  let currentStudentId = studentId;
  if (!currentStudentId && typeof window !== "undefined") {
    const { getCurrentUser } = await import("../../lib/auth");
    const user = getCurrentUser();
    currentStudentId = user?.id;
  }
  
  if (!currentStudentId) {
    return {
      success: false,
      message: "Student ID is required",
      code: 400,
    };
  }
  
  const params = new URLSearchParams({ student_id: currentStudentId });
  const response = await apiGet<any[]>(`/student/bookings?${params.toString()}`);
  
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
 * Payload: { appointment_id, student_id?, reason? }
 * Backend returns: { id, status: "cancelled", penalty_applied, penalty? }
 */
export async function cancelBooking(
  payload: CancelBookingPayload
): Promise<ApiResponse<CancelBookingResponse>> {
  // Get current user ID if student_id not provided
  let studentId = payload.student_id;
  if (!studentId && typeof window !== "undefined") {
    const { getCurrentUser } = await import("../../lib/auth");
    const user = getCurrentUser();
    studentId = user ? parseInt(user.id) : undefined;
  }
  
  const backendPayload: any = {
    appointment_id: payload.appointment_id,
    reason: payload.reason || "",
  };
  
  // Include student_id if available (backend may use authenticated user, but we include it for clarity)
  if (studentId) {
    backendPayload.student_id = studentId;
  }
  
  const response = await apiPost<any>("/student/cancel-booking", backendPayload);
  
  if (response.success && response.data) {
    // Backend returns data with penalty_applied and optional penalty fields
    return {
      ...response,
      data: response.data as CancelBookingResponse,
    };
  }
  
  return response as ApiResponse<CancelBookingResponse>;
}

/**
 * GET /student/fines?student_id=:student_id
 * Returns all fines for a student
 * Note: studentId is the logged-in user's ID
 */
export async function getStudentFines(
  studentId?: string
): Promise<ApiResponse<Fine[]>> {
  // Get current user ID if studentId not provided
  let currentStudentId = studentId;
  if (!currentStudentId && typeof window !== "undefined") {
    const { getCurrentUser } = await import("../../lib/auth");
    const user = getCurrentUser();
    currentStudentId = user?.id;
  }
  
  if (!currentStudentId) {
    return {
      success: false,
      message: "Student ID is required",
      code: 400,
    };
  }
  
  const params = new URLSearchParams({ student_id: currentStudentId });
  const response = await apiGet<any>(`/student/fines?${params.toString()}`);
  
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
 * GET /student/debt?student_id=:student_id
 * Returns total debt information for a student
 * Note: studentId is the logged-in user's ID
 */
export async function getStudentDebt(
  studentId?: string
): Promise<ApiResponse<StudentDebt>> {
  // Get current user ID if studentId not provided
  let currentStudentId = studentId;
  if (!currentStudentId && typeof window !== "undefined") {
    const { getCurrentUser } = await import("../../lib/auth");
    const user = getCurrentUser();
    currentStudentId = user?.id;
  }
  
  if (!currentStudentId) {
    return {
      success: false,
      message: "Student ID is required",
      code: 400,
    };
  }
  
  const params = new URLSearchParams({ student_id: currentStudentId });
  const response = await apiGet<any>(`/student/debt?${params.toString()}`);
  
  if (response.success && response.data) {
    const { transformStudentDebt, transformStudentFines } = await import("../utils/responseTransformers");
    // Get fines separately to include in debt response
    const finesResponse = await getStudentFines(currentStudentId);
    const fines = finesResponse.success ? finesResponse.data : [];
    
    return {
      ...response,
      data: transformStudentDebt(response.data, fines),
    };
  }
  
  return response as ApiResponse<StudentDebt>;
}
