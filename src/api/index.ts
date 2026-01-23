/**
 * Main API Module
 * Exports all API wrapper functions that automatically route to mock or real API
 * based on configuration flag
 * 
 * Usage:
 * ```typescript
 * import { getVehicles, createVehicle } from '@/api';
 * 
 * // Will use mock or real API based on NEXT_PUBLIC_API_MODE
 * const vehicles = await getVehicles();
 * ```
 */

// Export all wrapper functions
export * from "./wrappers/auth";
export * from "./wrappers/classtype";
export * from "./wrappers/teacher-resources";
export * from "./wrappers/teacher-schedules";
export * from "./wrappers/system-settings";
export * from "./wrappers/penalties";
export * from "./wrappers/users";
export * from "./wrappers/vehicles";
export * from "./wrappers/classrooms";
export * from "./wrappers/teachers";
export * from "./wrappers/students";
export * from "./wrappers/dashboard";
export * from "./wrappers/attendance";
export * from "./wrappers/resources";

// Export appointments with explicit naming to avoid conflict with student.getAvailableSlots
export {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  getAvailableSlots as getAppointmentAvailableSlots,
} from "./wrappers/appointments";

// Export student functions with explicit naming
export {
  getAvailableSlots as getStudentAvailableSlots,
  bookClass,
  getStudentBookings,
  cancelBooking,
  getStudentFines,
  getStudentDebt,
} from "./wrappers/student";

// Export configuration utilities
export {
  getApiConfig,
  setApiConfig,
  isMockMode,
  isRealMode,
  getApiBaseUrl,
  type ApiMode,
  type ApiConfig,
} from "../config/api.config";
