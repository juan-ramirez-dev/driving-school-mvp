/**
 * Shared types for mock API entities
 */

export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  last_name?: string;
  email: string;
  phone: string;
  document?: string;
  licenseNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  last_name?: string;
  email: string;
  phone: string;
  legalId: string;
  dateOfBirth: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TimeBlockSize = "15min" | "30min" | "1h" | "2h";

export interface TeacherAvailability {
  teacherId: string;
  date: string; // Format: "YYYY-MM-DD"
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  blockSize: TimeBlockSize;
  availableSlots: string[]; // Array of time slot IDs or time strings
}

export interface DashboardStats {
  activeStudents: number;
  lastMonthReservations: number;
  completedReservations: number;
  reservationsByTeacher?: Record<string, number>;
}

export interface Reservation {
  id: string;
  studentId: string;
  teacherId: string;
  vehicleId?: string;
  classroomId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  completedAt?: string;
}

export interface RUNTExportData {
  exportDate: string;
  students: Array<{
    legalId: string;
    name: string;
    completedClasses: number;
    status: string;
  }>;
  teachers: Array<{
    licenseNumber: string;
    name: string;
    classesTaught: number;
  }>;
  vehicles: Array<{
    licensePlate: string;
    brand: string;
    model: string;
  }>;
}

// Appointment types
export interface Appointment {
  id: string;
  teacher_id: string;
  student_id: string;
  class_type_id: string;
  resource_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  teacher?: Teacher;
  student?: Student;
  classType?: ClassType;
  resource?: Resource;
}

// Class Type
export interface ClassType {
  id: string;
  name: string;
  requires_resource: boolean;
  created_at?: string;
  updated_at?: string;
}

// Resource (extend existing)
export interface Resource {
  id: string;
  name: string;
  type: "classroom" | "vehicle";
  plate?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
  active: boolean;
  teachers?: Teacher[];
  created_at?: string;
  updated_at?: string;
}

// Teacher Resource Assignment
export interface TeacherResource {
  id: string;
  user_id: string;
  resource_id: string;
  user?: Teacher;
  resource?: Resource;
  created_at?: string;
  updated_at?: string;
}

// Teacher Schedule
export interface TeacherSchedule {
  id: string;
  user_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  slot_minutes: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// System Setting
export interface SystemSetting {
  id: string;
  setting_key: string;
  type: "string" | "int" | "bool" | "json";
  value: string | number | boolean;
  created_at?: string;
  updated_at?: string;
}

// Penalty
export interface Penalty {
  id: string;
  user_id: string;
  appointment_id?: string;
  amount: number;
  reason: string;
  paid: boolean;
  paid_at?: string | null;
  user?: {
    id: string;
    name: string;
    document: string;
  };
  appointment?: Appointment;
  created_at?: string;
  updated_at?: string;
}

// Available Slot
export interface AvailableSlot {
  start: string;
  end: string;
}
