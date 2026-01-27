/**
 * Response transformation helpers
 * Transform backend API responses to match frontend expected formats
 */

import type { Reservation, Vehicle, Teacher, Student, TeacherAvailability, TimeBlockSize } from "../mocks/types";
import type {
  StudentBooking,
  Fine,
  StudentDebt,
  AvailableSlot,
  ClassType as StudentClassType,
} from "../mocks/student";
import type { TeacherClassesResponse } from "../mocks/attendance";

/**
 * Transform dashboard active students response
 * Backend: { total, active, inactive }
 * Frontend: { count: number }
 */
export function transformDashboardActiveStudents(
  backendResponse: { total?: number; active?: number; inactive?: number }
): { count: number } {
  return {
    count: backendResponse.total || backendResponse.active || 0,
  };
}

/**
 * Transform dashboard reservations response
 * Backend: { total, attended, not_attended, completion_rate, reservations: [...] }
 * Frontend: { count: number, reservations: Reservation[] }
 */
export function transformDashboardReservations(
  backendResponse: any,
  reservations?: Reservation[]
): { count: number; reservations: Reservation[] } {
  // If reservations are already provided (from parameter), use them
  // Otherwise, transform from backendResponse.reservations
  let transformedReservations: Reservation[] = [];
  
  if (reservations && reservations.length > 0) {
    // Already transformed, use as is
    transformedReservations = reservations;
  } else if (backendResponse.reservations && Array.isArray(backendResponse.reservations)) {
    // Transform backend reservations to frontend format
    transformedReservations = backendResponse.reservations.map((reservation: any) => {
      // Extract date part (remove time if present)
      const dateStr = reservation.date || "";
      const date = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
      
      // Format time strings (remove seconds if present)
      const startTime = reservation.start_time?.substring(0, 5) || reservation.start_time || "";
      const endTime = reservation.end_time?.substring(0, 5) || reservation.end_time || "";
      
      // Map resource to vehicleId or classroomId based on type
      let vehicleId: string | undefined;
      let classroomId: string | undefined;
      if (reservation.resource) {
        const resourceId = String(reservation.resource.id);
        if (reservation.resource.type === "vehicle") {
          vehicleId = resourceId;
        } else if (reservation.resource.type === "classroom") {
          classroomId = resourceId;
        }
      } else if (reservation.resource_id) {
        // Fallback: if we have resource_id but no resource object, use it as vehicleId
        vehicleId = String(reservation.resource_id);
      }
      
      // Map status (backend: "completed", "cancelled", "scheduled", "confirmed")
      // Frontend: "pending" | "confirmed" | "completed" | "cancelled"
      let status: "pending" | "confirmed" | "completed" | "cancelled" = "pending";
      if (reservation.status === "completed") {
        status = "completed";
      } else if (reservation.status === "cancelled") {
        status = "cancelled";
      } else if (reservation.status === "confirmed") {
        status = "confirmed";
      } else if (reservation.status === "scheduled") {
        status = "pending";
      }
      
      // Extract completedAt from updated_at when status is completed
      const completedAt = status === "completed" && reservation.updated_at
        ? reservation.updated_at
        : undefined;
      
      return {
        id: String(reservation.id),
        studentId: String(reservation.student_id || reservation.student?.id || ""),
        teacherId: String(reservation.teacher_id || reservation.teacher?.id || ""),
        vehicleId,
        classroomId,
        date,
        startTime,
        endTime,
        status,
        createdAt: reservation.created_at || new Date().toISOString(),
        completedAt,
      };
    });
  }
  
  return {
    count: backendResponse.total || backendResponse.count || transformedReservations.length,
    reservations: transformedReservations,
  };
}

/**
 * Transform teacher classes response
 * Backend: { teacher_id, date, theoretical: [], practical: [] }
 * Frontend: { theoreticalClasses: [], practicalClasses: [] }
 */
export function transformTeacherClasses(
  backendResponse: any
): TeacherClassesResponse {
  // Handle both object format and array format for backward compatibility
  let theoretical: any[] = [];
  let practical: any[] = [];
  
  if (Array.isArray(backendResponse)) {
    // Old format: flat array of appointments
    backendResponse.forEach((appointment) => {
      const classTypeId = appointment.class_type_id;
      const isTheoretical = classTypeId === 1 || classTypeId === "1";
      
      const classData = transformAppointmentToClass(appointment);
      
      if (isTheoretical) {
        theoretical.push(classData);
      } else {
        practical.push(classData);
      }
    });
  } else if (backendResponse && typeof backendResponse === "object") {
    // New format: { teacher_id, date, theoretical: [], practical: [] }
    theoretical = (backendResponse.theoretical || []).map(transformAppointmentToClass);
    practical = (backendResponse.practical || []).map(transformAppointmentToClass);
  }

  return {
    theoreticalClasses: theoretical,
    practicalClasses: practical,
  };
}

/**
 * Transform a single appointment to class format
 */
function transformAppointmentToClass(appointment: any): any {
  return {
    id: String(appointment.id),
    teacherId: String(appointment.teacher_id || appointment.teacherId),
    date: appointment.date,
    startTime: appointment.start_time?.substring(0, 5) || appointment.startTime || appointment.start_time,
    endTime: appointment.end_time?.substring(0, 5) || appointment.endTime || appointment.end_time,
    student: appointment.student
      ? {
          studentId: String(appointment.student.id),
          name: appointment.student.name,
          legalId: appointment.student.document || appointment.student.legalId,
          phone: appointment.student.number_phone || appointment.student.phone,
        }
      : undefined,
    students: appointment.students || [],
    attendanceStatus: appointment.attendance_status || appointment.attendanceStatus || "pending",
    canCancelWithoutReason: true,
    isCancelled: appointment.status === "cancelled" || appointment.isCancelled === true,
  };
}

/**
 * Transform available slots response
 * Backend: Nested structure with slots, teachers, resources, classTypes
 * Frontend: Flat array of AvailableSlot
 * 
 * Backend response structure:
 * {
 *   "data": {
 *     "slots": [
 *       {
 *         "date": "2026-01-27",
 *         "startTime": "08:00",
 *         "endTime": "09:00",
 *         "options": [
 *           {
 *             "id": "slot_4_2026-01-27_0800_1",
 *             "teacher_id": 4,
 *             "resource_id": 1,
 *             "class_type_id": 1,
 *             "availableSpots": 20,
 *             "totalCapacity": 20,
 *             "currentBookings": 0
 *           }
 *         ]
 *       }
 *     ],
 *     "teachers": { "4": { "id": 4, "name": "Juan Pérez", "document": 12345678 } },
 *     "resources": { "1": { "id": 1, "name": "Aula 101", "type": "classroom", "capacity": 20 } },
 *     "classTypes": { "1": { "id": 1, "name": "Teórica", "requires_resource": true } }
 *   }
 * }
 */

export interface SlotOption {
  id: string;
  teacher_id: number;
  resource_id: number;
  class_type_id: number;
  availableSpots: number;
  totalCapacity: number;
  currentBookings: number;
}

export interface SlotGroup {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  options: SlotOption[];
}

export interface BackendAvailableSlotsResponse {
  slots: SlotGroup[];
  teachers: Record<string, {
    id: number;
    name: string;
    document: number;
  }>;
  resources: Record<string, {
    id: number;
    name: string;
    type: "classroom" | "vehicle";
    capacity: number;
  }>;
  classTypes: Record<string, {
    id: number;
    name: string;
    requires_resource: boolean;
  }>;
}

export function transformAvailableSlots(backendResponse: BackendAvailableSlotsResponse): AvailableSlot[] {
  const result: AvailableSlot[] = [];
  
  // Extract maps from response
  const teachers = backendResponse.teachers || {};
  const resources = backendResponse.resources || {};
  const classTypes = backendResponse.classTypes || {};
  
  // Iterate through each slot group
  backendResponse.slots.forEach((slotGroup: SlotGroup) => {
    const date = slotGroup.date;
    // Format time strings to HH:mm format
    const startTime = slotGroup.startTime?.substring(0, 5) || slotGroup.startTime;
    const endTime = slotGroup.endTime?.substring(0, 5) || slotGroup.endTime;
    
    // Each option becomes a separate AvailableSlot
    slotGroup.options.forEach((option: SlotOption) => {
      // Look up teacher from map
      const teacherIdStr = String(option.teacher_id);
      const teacher = teachers[teacherIdStr] || { id: option.teacher_id, name: "Instructor", document: 0 };
      
      // Look up resource from map
      const resourceIdStr = String(option.resource_id);
      const resource = resources[resourceIdStr] || { 
        id: option.resource_id, 
        name: "Recurso", 
        type: "classroom" as const, 
        capacity: 0 
      };
      
      // Look up class type from map
      const classTypeIdStr = String(option.class_type_id);
      const classType = classTypes[classTypeIdStr] || { 
        id: option.class_type_id, 
        name: "Práctica", 
        requires_resource: true 
      };
      
      // Convert class type name to enum value
      const classTypeName = classType.name?.toLowerCase() || "";
      let classTypeEnum: StudentClassType = "practical";
      if (
        classTypeName.includes("teórica") ||
        classTypeName.includes("teorica") ||
        classTypeName.includes("theoretical") ||
        classType.id === 1
      ) {
        classTypeEnum = "theoretical";
      }
      
      result.push({
        id: option.id,
        date: date,
        startTime: startTime,
        endTime: endTime,
        classType: classTypeEnum,
        teacherId: String(teacher.id),
        teacherName: teacher.name,
        availableSpots: option.availableSpots,
        totalSpots: option.totalCapacity,
        resourceId: resource.id,
        resourceName: resource.name,
        resourceType: resource.type,
        resourceCapacity: resource.capacity,
      } as AvailableSlot & {
        resourceId: number;
        resourceName: string;
        resourceType: "classroom" | "vehicle";
        resourceCapacity: number;
      });
    });
  });
  
  return result;
}

/**
 * Transform student bookings response
 * Backend: Array of appointments
 * Frontend: StudentBooking[]
 */
export function transformStudentBookings(
  backendResponse: any[]
): StudentBooking[] {
  return backendResponse.map((appointment) => {
    // Extract date part (remove time if present)
    const dateStr = appointment.date || "";
    const date = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    
    // Format time strings (remove seconds if present)
    const startTime = appointment.start_time?.substring(0, 5) || appointment.start_time || "";
    const endTime = appointment.end_time?.substring(0, 5) || appointment.end_time || "";
    
    // Determine class type from class_type object or class_type_id
    let classType: "theoretical" | "practical" = "practical";
    if (appointment.class_type) {
      // Use class_type name if available
      const className = appointment.class_type.name?.toLowerCase() || "";
      if (className.includes("teórica") || className.includes("teorica") || className.includes("theoretical")) {
        classType = "theoretical";
      } else {
        classType = "practical";
      }
    } else if (appointment.class_type_id) {
      // Fallback to ID-based mapping: ID 1 = theoretical, ID 2 = practical
      classType = appointment.class_type_id === 1 ? "theoretical" : "practical";
    }
    
    // Build teacher name
    const teacherName = appointment.teacher
      ? `${appointment.teacher.name || ""} ${appointment.teacher.last_name || ""}`.trim() || "Instructor"
      : "Instructor";
    
    return {
      id: String(appointment.id), 
      studentId: String(appointment.student_id),
      classType,
      date,
      startTime,
      endTime,
      teacherId: String(appointment.teacher_id),
      teacherName,
      status:
        appointment.status === "completed"
          ? "completed"
          : appointment.status === "cancelled"
          ? "cancelled"
          : "scheduled",
      createdAt: appointment.created_at || new Date().toISOString(),
      cancelledAt: appointment.status === "cancelled" ? appointment.updated_at : undefined,
      // Teacher details
      teacher: appointment.teacher
        ? {
            id: String(appointment.teacher.id),
            name: appointment.teacher.name || "",
            last_name: appointment.teacher.last_name,
            email: appointment.teacher.email,
            phone: appointment.teacher.number_phone || appointment.teacher.phone,
          }
        : undefined,
      // Class type details
      classTypeDetails: appointment.class_type
        ? {
            id: appointment.class_type.id,
            name: appointment.class_type.name || "",
            requires_resource: appointment.class_type.requires_resource || false,
          }
        : undefined,
      // Resource details
      resource: appointment.resource
        ? {
            id: String(appointment.resource.id),
            name: appointment.resource.name || "",
            type: appointment.resource.type === "vehicle" ? "vehicle" : "classroom",
            plate: appointment.resource.plate,
            brand: appointment.resource.brand,
            model: appointment.resource.model,
            year: appointment.resource.year,
            color: appointment.resource.color,
            capacity: appointment.resource.capacity,
          }
        : undefined,
      // Attendance information
      attendanceStatus: appointment.attendance_status || "pending",
      checkedInAt: appointment.checked_in_at || undefined,
      attendanceNotes: appointment.attendance_notes || undefined,
      // Cancellation information
      cancellationReason: appointment.cancellation_reason || undefined,
    };
  });
}

/**
 * Transform student fines response
 * Backend: { data: [], summary: {} }
 * Frontend: Fine[]
 */
export function transformStudentFines(backendResponse: any): Fine[] {
  const fines = backendResponse.data || backendResponse;
  
  if (!Array.isArray(fines)) {
    return [];
  }

  return fines.map((penalty: any) => ({
    id: String(penalty.id),
    studentId: String(penalty.user_id),
    reason: penalty.reason || "Multa",
    date: penalty.created_at?.substring(0, 10) || new Date().toISOString().substring(0, 10),
    amount: penalty.amount || 0,
    isPaid: penalty.paid || false,
    createdAt: penalty.created_at || new Date().toISOString(),
  }));
}

/**
 * Transform student debt response
 * Backend: { user_id, total_debt, unpaid_penalties, can_book }
 * Frontend: { totalDebt, outstandingFines, pendingPayments, fines[] }
 */
export function transformStudentDebt(
  backendResponse: any,
  fines?: Fine[]
): StudentDebt {
  const outstandingFines = backendResponse.unpaid_penalties || backendResponse.total_debt || 0;
  const pendingPayments = 0; // Backend doesn't provide this, set to 0
  const totalDebt = backendResponse.total_debt || outstandingFines;

  return {
    totalDebt,
    outstandingFines,
    pendingPayments,
    fines: fines || [],
  };
}

/**
 * Transform vehicles response
 * Backend: { id, name, plate, brand, model, year, color, active, ... }
 * Frontend: { id, licensePlate, brand, model, year, color, isActive, ... }
 */
export function transformVehicles(backendResponse: any[]): Vehicle[] {
  return backendResponse.map((vehicle: any) => ({
    id: String(vehicle.id),
    licensePlate: vehicle.plate || vehicle.licensePlate || "",
    brand: vehicle.brand || "",
    model: vehicle.model || "",
    year: vehicle.year || new Date().getFullYear(),
    color: vehicle.color || "",
    isActive: vehicle.active !== undefined ? vehicle.active : vehicle.isActive !== undefined ? vehicle.isActive : true,
    createdAt: vehicle.created_at || vehicle.createdAt || new Date().toISOString(),
    updatedAt: vehicle.updated_at || vehicle.updatedAt || new Date().toISOString(),
  }));
}

/**
 * Transform teachers response
 * Backend: { id, name, last_name, email, phone, document, licenseNumber, active, ... }
 * Frontend: { id, name, last_name?, email, phone, document?, licenseNumber, isActive, ... }
 */
export function transformTeachers(backendResponse: any[]): Teacher[] {
  return backendResponse.map((teacher: any) => {
    // If backend has separate name and last_name, keep them separate
    // If backend only has combined name, try to split it or keep as is
    let name = teacher.name || "";
    let last_name = teacher.last_name;
    
    // If no last_name from backend but name contains space, try to split
    if (!last_name && name.includes(" ")) {
      const parts = name.split(" ");
      name = parts[0] || "";
      last_name = parts.slice(1).join(" ") || undefined;
    }
    
    return {
      id: String(teacher.id),
      name: name,
      last_name: last_name,
      email: teacher.email || "",
      phone: teacher.number_phone || teacher.phone || "",
      document: teacher.document,
      licenseNumber: teacher.licenseNumber || teacher.license_number || "",
      isActive: teacher.active !== undefined ? teacher.active : teacher.isActive !== undefined ? teacher.isActive : true,
      createdAt: teacher.created_at || teacher.createdAt || new Date().toISOString(),
      updatedAt: teacher.updated_at || teacher.updatedAt || new Date().toISOString(),
    };
  });
}

/**
 * Transform teacher availability response
 * Backend: [{ teacher_id, teacher_name, schedules: [{ day_of_week, day_name, start_time, end_time, slot_minutes, active }] }]
 * Frontend: TeacherAvailability[] (flat array)
 * Note: Since backend uses day_of_week (weekly recurring), we use a placeholder date format
 */
export function transformTeacherAvailability(backendResponse: any[]): TeacherAvailability[] {
  const availability: TeacherAvailability[] = [];
  
  backendResponse.forEach((teacherData: any) => {
    const teacherId = String(teacherData.teacher_id);
    const schedules = teacherData.schedules || [];
    
    schedules.forEach((schedule: any) => {
      // Convert slot_minutes back to blockSize
      const slotMinutes = schedule.slot_minutes || 60;
      let blockSize: TimeBlockSize = "1h";
      if (slotMinutes === 15) blockSize = "15min";
      else if (slotMinutes === 30) blockSize = "30min";
      else if (slotMinutes === 60) blockSize = "1h";
      else if (slotMinutes === 120) blockSize = "2h";
      
      // Use day_of_week as part of a placeholder date (we'll use Monday of current week + day_of_week)
      // This allows the frontend to work with the existing date-based structure
      const today = new Date();
      const currentDay = today.getDay();
      const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Monday
      const monday = new Date(today.setDate(diff));
      const scheduleDate = new Date(monday);
      scheduleDate.setDate(monday.getDate() + (schedule.day_of_week || 0));
      const dateString = scheduleDate.toISOString().split('T')[0];
      
      availability.push({
        teacherId: teacherId,
        date: dateString, // Placeholder date based on day_of_week
        startTime: schedule.start_time?.substring(0, 5) || schedule.start_time || "",
        endTime: schedule.end_time?.substring(0, 5) || schedule.end_time || "",
        blockSize: blockSize,
        availableSlots: [],
      });
    });
  });
  
  return availability;
}

/**
 * Transform students response
 * Backend: { id, name, last_name, email, phone, document, dateOfBirth, address, active, ... }
 * Frontend: { id, name, last_name?, email, phone, legalId, dateOfBirth, address, isActive, ... }
 */
export function transformStudents(backendResponse: any[]): Student[] {
  return backendResponse.map((student: any) => {
    // If backend has separate name and last_name, keep them separate
    // If backend only has combined name, try to split it or keep as is
    let name = student.name || "";
    let last_name = student.last_name;
    
    // If no last_name from backend but name contains space, try to split
    if (!last_name && name.includes(" ")) {
      const parts = name.split(" ");
      name = parts[0] || "";
      last_name = parts.slice(1).join(" ") || undefined;
    }
    
    // Handle legalId - can be number or string, convert to string
    let legalId = "";
    if (student.document !== undefined && student.document !== null && student.document !== "") {
      legalId = String(student.document);
    } else if (student.legalId !== undefined && student.legalId !== null && student.legalId !== "") {
      legalId = String(student.legalId);
    }
    
    return {
      id: String(student.id),
      name: name,
      last_name: last_name,
      email: student.email || "",
      phone: student.number_phone || student.phone || "",
      legalId: legalId,
      dateOfBirth: student.dateOfBirth || student.date_of_birth || "",
      address: student.address || "",
      isActive: student.active !== undefined 
        ? Boolean(student.active) 
        : student.isActive !== undefined 
        ? Boolean(student.isActive) 
        : true,
      createdAt: student.created_at || student.createdAt || new Date().toISOString(),
      updatedAt: student.updated_at || student.updatedAt || new Date().toISOString(),
    };
  });
}
