/**
 * Real API Client for Teacher Management
 * Makes actual HTTP requests to backend endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import { ApiResponse } from "../utils/errorHandler";
import { Teacher, TeacherAvailability, TimeBlockSize } from "../mocks/types";

/**
 * GET /teachers
 * Returns a list of teachers
 * Note: Data extraction from nested structure is handled automatically in apiRequest
 */
export async function getTeachers(): Promise<ApiResponse<Teacher[]>> {
  const response = await apiGet<any[]>("/teachers");
  
  if (response.success && response.data) {
    const { transformTeachers } = await import("../utils/responseTransformers");
    return {
      ...response,
      data: transformTeachers(response.data),
    };
  }
  
  return response as ApiResponse<Teacher[]>;
}

/**
 * POST /teachers
 * Creates a new teacher
 * Backend expects: name, last_name, email, number_phone, document, licenseNumber
 */
export async function createTeacher(
  data: {
    name: string;
    last_name: string;
    email: string;
    phone: string;
    document: string;
    licenseNumber: string;
  }
): Promise<ApiResponse<Teacher>> {
  // Transform phone to number_phone for backend
  const backendData = {
    ...data,
    number_phone: data.phone,
  };
  delete (backendData as any).phone;
  
  const response = await apiPost<any>("/teachers", backendData);
  
  if (response.success && response.data) {
    const { transformTeachers } = await import("../utils/responseTransformers");
    // Transform single teacher response
    const transformed = transformTeachers([response.data]);
    return {
      ...response,
      data: transformed[0],
    };
  }
  
  return response as ApiResponse<Teacher>;
}

/**
 * PUT /teachers/:id
 * Updates an existing teacher
 * Backend expects: name, last_name, email, number_phone, document, licenseNumber
 */
export async function updateTeacher(
  id: string,
  data: Partial<{
    name: string;
    last_name: string;
    email: string;
    phone: string;
    document: string;
    licenseNumber: string;
    isActive: boolean;
  }>
): Promise<ApiResponse<Teacher>> {
  // Transform phone to number_phone for backend
  const backendData: any = { ...data };
  if (data.phone !== undefined) {
    backendData.number_phone = data.phone;
    delete backendData.phone;
  }
  
  const response = await apiPut<any>(`/teachers/${id}`, backendData);
  
  if (response.success && response.data) {
    const { transformTeachers } = await import("../utils/responseTransformers");
    // Transform single teacher response
    const transformed = transformTeachers([response.data]);
    return {
      ...response,
      data: transformed[0],
    };
  }
  
  return response as ApiResponse<Teacher>;
}

/**
 * DELETE /teachers/:id
 * Marks a teacher as inactive
 */
export async function deleteTeacher(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return apiDelete<{ message: string }>(`/teachers/${id}`);
}

/**
 * GET /teachers/availability
 * Retrieves teacher availability data
 */
export async function getTeacherAvailability(): Promise<
  ApiResponse<TeacherAvailability[]>
> {
  const response = await apiGet<any[]>("/teachers/availability/all");
  
  if (response.success && response.data) {
    const { transformTeacherAvailability } = await import("../utils/responseTransformers");
    return {
      ...response,
      data: transformTeacherAvailability(response.data),
    };
  }
  
  return response as ApiResponse<TeacherAvailability[]>;
}

/**
 * POST /teachers/availability
 * Sets teacher availability by time blocks
 * Backend expects: { user_id, availability: [{ date, start_time, end_time, day_of_week, slot_minutes }] }
 */
export async function setTeacherAvailability(
  data: Omit<TeacherAvailability, "availableSlots">
): Promise<ApiResponse<TeacherAvailability>> {
  // Convert blockSize to slot_minutes
  const blockSizeToMinutes: Record<TimeBlockSize, number> = {
    "15min": 15,
    "30min": 30,
    "1h": 60,
    "2h": 120,
  };
  const slotMinutes = blockSizeToMinutes[data.blockSize] || 60;
  
  // Convert date to day_of_week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dateObj = new Date(data.date);
  const dayOfWeek = dateObj.getDay(); // 0-6
  
  // Transform frontend format to backend format
  const backendData = {
    user_id: data.teacherId,
    availability: [
      {
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime,
        day_of_week: dayOfWeek,
        slot_minutes: slotMinutes,
      },
    ],
  };
  
  const response = await apiPost<any>("/teachers/availability/all", backendData);
  
  if (response.success && response.data) {
    const { transformTeacherAvailability } = await import("../utils/responseTransformers");
    // Transform response back to frontend format
    const transformed = transformTeacherAvailability([response.data]);
    return {
      ...response,
      data: transformed[0] || {
        teacherId: data.teacherId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        blockSize: data.blockSize,
        availableSlots: [],
      },
    };
  }
  
  return response as ApiResponse<TeacherAvailability>;
}
