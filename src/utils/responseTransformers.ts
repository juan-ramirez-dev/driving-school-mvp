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
 * Backend: { total, confirmed, scheduled, cancelled } or similar
 * Frontend: { count: number, reservations: Reservation[] }
 */
export function transformDashboardReservations(
  backendResponse: any,
  reservations?: Reservation[]
): { count: number; reservations: Reservation[] } {
  return {
    count: backendResponse.total || backendResponse.count || 0,
    reservations: reservations || [],
  };
}

/**
 * Transform teacher classes response
 * Backend: Flat array of appointments
 * Frontend: { theoreticalClasses: [], practicalClasses: [] }
 */
export function transformTeacherClasses(
  backendResponse: any[]
): TeacherClassesResponse {
  const theoreticalClasses: any[] = [];
  const practicalClasses: any[] = [];

  backendResponse.forEach((appointment) => {
    // Determine if theoretical or practical based on class_type_id or classType
    const classTypeId = appointment.class_type_id;
    const isTheoretical = classTypeId === 1 || classTypeId === "1";

    const classData = {
      id: String(appointment.id),
      teacherId: String(appointment.teacher_id),
      date: appointment.date,
      startTime: appointment.start_time?.substring(0, 5) || appointment.start_time,
      endTime: appointment.end_time?.substring(0, 5) || appointment.end_time,
      student: appointment.student
        ? {
            studentId: String(appointment.student.id),
            name: appointment.student.name,
            legalId: appointment.student.document || appointment.student.legalId,
            phone: appointment.student.number_phone || appointment.student.phone,
          }
        : undefined,
      students: appointment.students || [],
      attendanceStatus: appointment.attendance_status || "pending",
      canCancelWithoutReason: true,
      isCancelled: appointment.status === "cancelled",
    };

    if (isTheoretical) {
      theoreticalClasses.push(classData);
    } else {
      practicalClasses.push(classData);
    }
  });

  return {
    theoreticalClasses,
    practicalClasses,
  };
}

/**
 * Transform available slots response
 * Backend: Grouped by teacher structure
 * Frontend: Flat array of AvailableSlot
 */
export function transformAvailableSlots(backendResponse: any[]): AvailableSlot[] {
  const slots: AvailableSlot[] = [];

  backendResponse.forEach((teacherSlot) => {
    const teacherId = String(teacherSlot.teacher_id);
    const teacherName = teacherSlot.teacher_name || "Instructor";
    const date = teacherSlot.date;

    if (teacherSlot.slots && Array.isArray(teacherSlot.slots)) {
      teacherSlot.slots.forEach((slot: any, index: number) => {
        slots.push({
          id: `${teacherId}-${date}-${index}`,
          date: date,
          startTime: slot.start?.substring(0, 5) || slot.start,
          endTime: slot.end?.substring(0, 5) || slot.end,
          classType: teacherSlot.class_type_id === 1 ? "theoretical" : "practical",
          teacherId: teacherId,
          teacherName: teacherName,
          availableSpots: slot.available_spots || 1,
          totalSpots: slot.total_spots || 1,
        });
      });
    }
  });

  return slots;
}

/**
 * Transform student bookings response
 * Backend: Array of appointments
 * Frontend: StudentBooking[]
 */
export function transformStudentBookings(
  backendResponse: any[]
): StudentBooking[] {
  return backendResponse.map((appointment) => ({
    id: String(appointment.id),
    studentId: String(appointment.student_id),
    classType:
      appointment.class_type_id === 1 ? "theoretical" : "practical",
    date: appointment.date,
    startTime: appointment.start_time?.substring(0, 5) || appointment.start_time,
    endTime: appointment.end_time?.substring(0, 5) || appointment.end_time,
    teacherId: String(appointment.teacher_id),
    teacherName:
      appointment.teacher?.name ||
      `${appointment.teacher?.name || ""} ${appointment.teacher?.last_name || ""}`.trim() ||
      "Instructor",
    status:
      appointment.status === "completed"
        ? "completed"
        : appointment.status === "cancelled"
        ? "cancelled"
        : "scheduled",
    createdAt: appointment.created_at || new Date().toISOString(),
    cancelledAt: appointment.status === "cancelled" ? appointment.updated_at : undefined,
  }));
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
