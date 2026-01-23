/**
 * Appointments API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as realApi from "../appointments";
import { ApiResponse } from "../../utils/errorHandler";
import type {
  Appointment,
  AppointmentFilters,
  CreateAppointmentData,
  AvailableSlotsResponse,
} from "../appointments";

// Mock implementation - return empty array for now
async function getAppointmentsMock(
  filters?: AppointmentFilters
): Promise<ApiResponse<Appointment[]>> {
  return {
    success: true,
    data: [],
  };
}

async function getAppointmentByIdMock(
  id: string | number
): Promise<ApiResponse<Appointment>> {
  return {
    success: false,
    message: "Appointment not found",
    code: 404,
  };
}

async function createAppointmentMock(
  data: CreateAppointmentData
): Promise<ApiResponse<Appointment>> {
  return {
    success: false,
    message: "Mock mode: Cannot create appointments",
    code: 400,
  };
}

async function updateAppointmentMock(
  id: string | number,
  data: Partial<CreateAppointmentData>
): Promise<ApiResponse<Appointment>> {
  return {
    success: false,
    message: "Mock mode: Cannot update appointments",
    code: 400,
  };
}

async function deleteAppointmentMock(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return {
    success: false,
    message: "Mock mode: Cannot delete appointments",
    code: 400,
  };
}

async function getAllAppointmentsMock(
  filters?: AppointmentFilters
): Promise<ApiResponse<Appointment[]>> {
  return {
    success: true,
    data: [],
  };
}

async function updateAppointmentStatusMock(
  id: string | number,
  status: "scheduled" | "confirmed" | "cancelled" | "completed"
): Promise<ApiResponse<Appointment>> {
  return {
    success: false,
    message: "Mock mode: Cannot update appointment status",
    code: 400,
  };
}

async function getAvailableSlotsMock(filters: {
  teacher_id?: number;
  date?: string;
  class_type_id?: number;
  resource_id?: number;
}): Promise<ApiResponse<AvailableSlotsResponse>> {
  return {
    success: true,
    data: {
      date: filters.date || new Date().toISOString().split("T")[0],
      slots: [],
    },
  };
}

/**
 * GET /api/appointments
 */
export async function getAppointments(
  filters?: AppointmentFilters
): Promise<ApiResponse<Appointment[]>> {
  return isMockMode() 
    ? getAppointmentsMock(filters) 
    : realApi.getAppointments(filters);
}

/**
 * GET /api/appointments/{id}
 */
export async function getAppointmentById(
  id: string | number
): Promise<ApiResponse<Appointment>> {
  return isMockMode() 
    ? getAppointmentByIdMock(id) 
    : realApi.getAppointmentById(id);
}

/**
 * POST /api/appointments
 */
export async function createAppointment(
  data: CreateAppointmentData
): Promise<ApiResponse<Appointment>> {
  return isMockMode() 
    ? createAppointmentMock(data) 
    : realApi.createAppointment(data);
}

/**
 * PUT /api/appointments/{id}
 */
export async function updateAppointment(
  id: string | number,
  data: Partial<CreateAppointmentData>
): Promise<ApiResponse<Appointment>> {
  return isMockMode() 
    ? updateAppointmentMock(id, data) 
    : realApi.updateAppointment(id, data);
}

/**
 * DELETE /api/appointments/{id}
 */
export async function deleteAppointment(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode() 
    ? deleteAppointmentMock(id) 
    : realApi.deleteAppointment(id);
}

/**
 * GET /api/appointments-all
 */
export async function getAllAppointments(
  filters?: AppointmentFilters
): Promise<ApiResponse<Appointment[]>> {
  return isMockMode() 
    ? getAllAppointmentsMock(filters) 
    : realApi.getAllAppointments(filters);
}

/**
 * PATCH /api/appointments/{id}/status
 */
export async function updateAppointmentStatus(
  id: string | number,
  status: "scheduled" | "confirmed" | "cancelled" | "completed"
): Promise<ApiResponse<Appointment>> {
  return isMockMode() 
    ? updateAppointmentStatusMock(id, status) 
    : realApi.updateAppointmentStatus(id, status);
}

/**
 * GET /api/appointments/available-slots
 */
export async function getAvailableSlots(filters: {
  teacher_id?: number;
  date?: string;
  class_type_id?: number;
  resource_id?: number;
}): Promise<ApiResponse<AvailableSlotsResponse>> {
  return isMockMode() 
    ? getAvailableSlotsMock(filters) 
    : realApi.getAvailableSlots(filters);
}
