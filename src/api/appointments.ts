/**
 * Real API Client for Appointments
 * Makes actual HTTP requests to backend appointment endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "./client";
import { ApiResponse } from "../utils/errorHandler";

export interface Appointment {
  id: number;
  teacher_id: number;
  student_id: number;
  class_type_id: number;
  resource_id?: number | null;
  date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  teacher?: {
    id: number;
    name: string;
    document: string;
  };
  student?: {
    id: number;
    name: string;
    document: string;
  };
  classType?: {
    id: number;
    name: string;
    requires_resource: boolean;
  };
  resource?: {
    id: number;
    name: string;
    type: "classroom" | "vehicle";
  };
}

export interface AppointmentFilters {
  teacher_id?: number;
  student_id?: number;
  date?: string;
}

export interface CreateAppointmentData {
  teacher_id?: number;
  student_id?: number;
  class_type_id: number;
  resource_id?: number;
  date: string;
  start_time: string;
  end_time: string;
  status?: "scheduled" | "confirmed" | "cancelled" | "completed";
}

export interface AvailableSlot {
  start: string;
  end: string;
}

export interface AvailableSlotsResponse {
  date: string;
  slots: AvailableSlot[];
}

/**
 * GET /api/appointments
 * List active appointments (scheduled or confirmed)
 */
export async function getAppointments(
  filters?: AppointmentFilters
): Promise<ApiResponse<Appointment[]>> {
  const params = new URLSearchParams();
  if (filters?.teacher_id) {
    params.append("teacher_id", String(filters.teacher_id));
  }
  if (filters?.student_id) {
    params.append("student_id", String(filters.student_id));
  }
  if (filters?.date) {
    params.append("date", filters.date);
  }
  
  const endpoint = params.toString() 
    ? `/appointments?${params.toString()}` 
    : "/appointments";
  
  return apiGet<Appointment[]>(endpoint);
}

/**
 * GET /api/appointments/{id}
 * Get appointment by ID
 */
export async function getAppointmentById(
  id: string | number
): Promise<ApiResponse<Appointment>> {
  return apiGet<Appointment>(`/appointments/${id}`);
}

/**
 * POST /api/appointments
 * Create a new appointment
 */
export async function createAppointment(
  data: CreateAppointmentData
): Promise<ApiResponse<Appointment>> {
  return apiPost<Appointment>("/appointments", data);
}

/**
 * PUT /api/appointments/{id}
 * Update an appointment
 */
export async function updateAppointment(
  id: string | number,
  data: Partial<CreateAppointmentData>
): Promise<ApiResponse<Appointment>> {
  return apiPut<Appointment>(`/appointments/${id}`, data);
}

/**
 * DELETE /api/appointments/{id}
 * Delete an appointment
 */
export async function deleteAppointment(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return apiDelete<{ message: string }>(`/appointments/${id}`);
}

/**
 * GET /api/appointments-all
 * List all appointments (including cancelled and completed)
 */
export async function getAllAppointments(
  filters?: AppointmentFilters
): Promise<ApiResponse<Appointment[]>> {
  const params = new URLSearchParams();
  if (filters?.teacher_id) {
    params.append("teacher_id", String(filters.teacher_id));
  }
  if (filters?.student_id) {
    params.append("student_id", String(filters.student_id));
  }
  if (filters?.date) {
    params.append("date", filters.date);
  }
  
  const endpoint = params.toString() 
    ? `/appointments-all?${params.toString()}` 
    : "/appointments-all";
  
  return apiGet<Appointment[]>(endpoint);
}

/**
 * PATCH /api/appointments/{id}/status
 * Update appointment status
 */
export async function updateAppointmentStatus(
  id: string | number,
  status: "scheduled" | "confirmed" | "cancelled" | "completed"
): Promise<ApiResponse<Appointment>> {
  return apiPatch<Appointment>(`/appointments/${id}/status`, { status });
}

/**
 * GET /api/appointments/available-slots
 * Get available time slots for appointments
 */
export async function getAvailableSlots(filters: {
  teacher_id?: number;
  date?: string;
  class_type_id?: number;
  resource_id?: number;
}): Promise<ApiResponse<AvailableSlotsResponse>> {
  const params = new URLSearchParams();
  if (filters.teacher_id) {
    params.append("teacher_id", String(filters.teacher_id));
  }
  if (filters.date) {
    params.append("date", filters.date);
  }
  if (filters.class_type_id) {
    params.append("class_type_id", String(filters.class_type_id));
  }
  if (filters.resource_id) {
    params.append("resource_id", String(filters.resource_id));
  }
  
  const endpoint = `/appointments/available-slots?${params.toString()}`;
  return apiGet<AvailableSlotsResponse>(endpoint);
}
