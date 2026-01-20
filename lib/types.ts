export type ClassType = "theoretical" | "practical";

export type TimeSlotStatus = "available" | "unavailable" | "booked";

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  legalId?: string;
  role?: "student" | "admin" | "teacher";
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
}

export interface TimeSlot {
  id: string;
  startTime: string; // Format: "HH:mm" e.g., "08:00"
  endTime: string; // Format: "HH:mm" e.g., "10:00"
  date: string; // Format: "YYYY-MM-DD"
  status: TimeSlotStatus;
  instructorId?: string;
}

export interface Booking {
  id: string;
  userId: string;
  instructorId: string;
  classType: ClassType;
  date: string; // Format: "YYYY-MM-DD"
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  createdAt: string; // ISO timestamp
  status: "confirmed" | "cancelled";
}

export interface Availability {
  instructorId: string;
  date: string; // Format: "YYYY-MM-DD"
  availableSlots: string[]; // Array of time slot IDs
}
