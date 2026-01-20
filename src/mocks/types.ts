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
  email: string;
  phone: string;
  licenseNumber: string;
  specialization: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
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
