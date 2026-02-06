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
    last_name?: string;
    document: string;
    email?: string;
    number_phone?: string;
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
    plate?: string | null;
    brand?: string | null;
    model?: string | null;
    year?: number | null;
    color?: string | null;
    capacity?: number | null;
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
 * Validates resource requirement if class type requires it
 */
export async function createAppointment(
  data: CreateAppointmentData
): Promise<ApiResponse<Appointment>> {
  // Validate resource requirement
  if (data.class_type_id) {
    const { getClassTypeById } = await import("./classtype");
    const classTypeResponse = await getClassTypeById(data.class_type_id);
    if (classTypeResponse.success && classTypeResponse.data) {
      const { validateResourceRequirement } = await import("../utils/businessRules");
      const resourceValidation = validateResourceRequirement(
        classTypeResponse.data,
        data.resource_id
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
  
  const response = await apiPost<any>("/appointments", data);
  
  // Surface backend business-rule messages (422) for create
  if (!response.success && response.message) {
    if (response.message.includes("requiere un recurso"))
      return { ...response, message: "Este tipo de clase requiere un recurso" };
    if (response.message.includes("bloqueo") || response.message.includes("mantenimiento"))
      return { ...response, message: "El recurso no está disponible en ese horario (bloqueo o mantenimiento)." };
    if (response.message.includes("ocupado") && !response.message.includes("bloqueo"))
      return { ...response, message: "El recurso ya está ocupado en ese horario" };
    if (response.message.includes("Ya tiene agendada") || response.message.includes("mismo espacio"))
      return { ...response, message: "Ya tiene agendada una clase de este tipo en ese horario. No puede reservar dos veces el mismo espacio." };
    if (response.message.includes("periodo de acceso") || response.message.includes("máximo") || response.message.includes("semana"))
      return { ...response, message: response.message };
  }

  return response as ApiResponse<Appointment>;
}

/**
 * PUT /api/appointments/{id}
 * Update an appointment
 * Cannot update if appointment is completed
 * Validates resource requirement if class type requires it
 */
export async function updateAppointment(
  id: string | number,
  data: Partial<CreateAppointmentData>
): Promise<ApiResponse<Appointment>> {
  // Check if appointment can be modified
  try {
    const appointmentResponse = await getAppointmentById(id);
    if (appointmentResponse.success && appointmentResponse.data) {
      const { canModifyAppointment } = await import("../utils/businessRules");
      const validation = canModifyAppointment(appointmentResponse.data);
      if (!validation.canModify) {
        return {
          success: false,
          message: validation.error || "No se puede modificar una clase finalizada",
          code: 422,
        };
      }
      
      // Validate resource requirement if class_type_id is being updated
      if (data.class_type_id !== undefined) {
        const { getClassTypeById } = await import("./classtype");
        const classTypeResponse = await getClassTypeById(data.class_type_id);
        if (classTypeResponse.success && classTypeResponse.data) {
          const { validateResourceRequirement } = await import("../utils/businessRules");
          const resourceId = data.resource_id !== undefined 
            ? data.resource_id 
            : appointmentResponse.data.resource_id || null;
          const resourceValidation = validateResourceRequirement(
            classTypeResponse.data,
            resourceId
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
    }
  } catch (error) {
    // If we can't validate, continue (backend will validate)
    console.warn("Could not validate appointment modification:", error);
  }
  
  const response = await apiPut<any>(`/appointments/${id}`, data);
  
  // Surface backend business-rule messages (422) for update
  if (!response.success && response.message) {
    if (response.message.includes("finalizada") || response.message.includes("completada"))
      return { ...response, message: "No se puede modificar una clase finalizada" };
    if (response.message.includes("requiere un recurso"))
      return { ...response, message: "Este tipo de clase requiere un recurso" };
    if (response.message.includes("bloqueo") || response.message.includes("mantenimiento"))
      return { ...response, message: "El recurso no está disponible en ese horario (bloqueo o mantenimiento)." };
    if (response.message.includes("ocupado") && !response.message.includes("bloqueo"))
      return { ...response, message: "El recurso ya está ocupado en ese horario" };
    if (response.message.includes("Ya tiene agendada") || response.message.includes("mismo espacio"))
      return { ...response, message: "Ya tiene agendada una clase de este tipo en ese horario. No puede reservar dos veces el mismo espacio." };
    if (response.message.includes("periodo de acceso") || response.message.includes("máximo") || response.message.includes("semana"))
      return { ...response, message: response.message };
  }

  return response as ApiResponse<Appointment>;
}

/**
 * DELETE /api/appointments/{id}
 * Delete an appointment
 * Cannot delete if appointment is completed
 */
export async function deleteAppointment(
  id: string | number
): Promise<ApiResponse<{ message: string }>> {
  // Check if appointment can be modified
  try {
    const appointmentResponse = await getAppointmentById(id);
    if (appointmentResponse.success && appointmentResponse.data) {
      const { canModifyAppointment } = await import("../utils/businessRules");
      const validation = canModifyAppointment(appointmentResponse.data);
      if (!validation.canModify) {
        return {
          success: false,
          message: validation.error || "No se puede modificar una clase finalizada",
          code: 422,
        };
      }
    }
  } catch (error) {
    // If we can't validate, continue (backend will validate)
    console.warn("Could not validate appointment deletion:", error);
  }
  
  const response = await apiDelete<{ message: string }>(`/appointments/${id}`);
  
  // Handle specific error messages
  if (!response.success) {
    if (response.message?.includes("finalizada") || response.message?.includes("completada")) {
      return {
        ...response,
        message: "No se puede modificar una clase finalizada",
      };
    }
  }
  
  return response;
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
 * Cannot change status if current status is completed
 * Applies cancellation rules when status = "cancelled"
 */
export async function updateAppointmentStatus(
  id: string | number,
  status: "scheduled" | "confirmed" | "cancelled" | "completed"
): Promise<ApiResponse<Appointment>> {
  // Check if appointment can be modified
  try {
    const appointmentResponse = await getAppointmentById(id);
    if (appointmentResponse.success && appointmentResponse.data) {
      const appointment = appointmentResponse.data;
      
      // Cannot modify completed appointments
      if (appointment.status === "completed") {
        return {
          success: false,
          message: "No se puede modificar una clase finalizada",
          code: 422,
        };
      }
      
      // If setting to cancelled, check cancellation rules (backend will also validate)
      if (status === "cancelled" && appointment.student_id) {
        const { isCancellationLate } = await import("../utils/businessRules");
        const { getCancellationSettings } = await import("../utils/systemSettings");
        const settings = await getCancellationSettings();
        
        const isLate = await isCancellationLate(appointment.date, appointment.start_time);
        
        // If cancellation is not allowed after limit and it's late, return error
        if (!settings.allowAfterLimit && isLate) {
          return {
            success: false,
            message: "No puede cancelar; ha superado el tiempo límite.",
            code: 422,
          };
        }
      }
    }
  } catch (error) {
    // If we can't validate, continue (backend will validate)
    console.warn("Could not validate appointment status update:", error);
  }
  
  const response = await apiPatch<any>(`/appointments/${id}/status`, { status });
  
  // Handle specific error messages
  if (!response.success) {
    if (response.message?.includes("finalizada") || response.message?.includes("completada")) {
      return {
        ...response,
        message: "No se puede modificar una clase finalizada",
      };
    }
    if (response.message?.includes("tiempo límite") || response.message?.includes("superado")) {
      return {
        ...response,
        message: "No puede cancelar; ha superado el tiempo límite.",
      };
    }
  }
  
  return response as ApiResponse<Appointment>;
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
