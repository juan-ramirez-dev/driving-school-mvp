/**
 * Mock API for Student Dashboard
 * Simulates student class slots, bookings, cancellations, fines, and debt
 * Uses localStorage for persistence
 */

import {
  ApiResponse,
  HttpErrorCode,
  createSuccessResponse,
  handleError,
  simulateDelay,
  simulateRandomError,
} from "../utils/errorHandler";
import type { Teacher } from "./types";

export type ClassType = "theoretical" | "practical";

export type BookingStatus = "scheduled" | "completed" | "cancelled";

export interface AvailableSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  classType: ClassType;
  teacherId: string;
  teacherName: string;
  availableSpots: number;
  totalSpots: number;
}

export interface StudentBooking {
  id: string;
  studentId: string;
  classType: ClassType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  teacherId: string;
  teacherName: string;
  status: BookingStatus;
  createdAt: string;
  cancelledAt?: string;
}

export interface Fine {
  id: string;
  studentId: string;
  reason: string;
  date: string; // YYYY-MM-DD
  amount: number;
  isPaid: boolean;
  createdAt: string;
}

export interface StudentDebt {
  totalDebt: number;
  outstandingFines: number;
  pendingPayments: number;
  fines: Fine[];
}

export interface BookClassPayload {
  teacher_id: number;
  class_type_id: number;
  resource_id?: number;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
}

export interface CancelBookingPayload {
  appointment_id: number;
  student_id?: number; // Optional, backend may use authenticated user
  reason?: string;
}

export interface CancelBookingResponse {
  id: number;
  status: "cancelled";
  penalty_applied: boolean;
  penalty?: {
    id: number;
    amount: number;
    reason: string;
  };
}

// Storage keys
const STORAGE_KEYS = {
  SLOTS: "driving-school-student-slots",
  BOOKINGS: "driving-school-student-bookings",
  FINES: "driving-school-student-fines",
};

// Mock teachers for slots
const mockTeachers: Teacher[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@drivingschool.com",
    phone: "+1-555-0101",
    licenseNumber: "TCH-001",
    isActive: true,
    createdAt: "2025-01-05T08:00:00Z",
    updatedAt: "2025-01-05T08:00:00Z",
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "maria.garcia@drivingschool.com",
    phone: "+1-555-0102",
    licenseNumber: "TCH-002",
    isActive: true,
    createdAt: "2025-01-08T09:15:00Z",
    updatedAt: "2025-01-08T09:15:00Z",
  },
  {
    id: "3",
    name: "Carlos Rodriguez",
    email: "carlos.rodriguez@drivingschool.com",
    phone: "+1-555-0103",
    licenseNumber: "TCH-003",
    isActive: true,
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "4",
    name: "Ana Martinez",
    email: "ana.martinez@drivingschool.com",
    phone: "+1-555-0104",
    licenseNumber: "TCH-004",
    isActive: true,
    createdAt: "2025-01-12T08:30:00Z",
    updatedAt: "2025-01-12T08:30:00Z",
  },
  {
    id: "5",
    name: "Roberto Silva",
    email: "roberto.silva@drivingschool.com",
    phone: "+1-555-0105",
    licenseNumber: "TCH-005",
    isActive: true,
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2025-01-15T09:00:00Z",
  },
];

// Helper functions for localStorage
function getStoredSlots(): AvailableSlot[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.SLOTS);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveSlots(slots: AvailableSlot[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
}

function getStoredBookings(): StudentBooking[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveBookings(bookings: StudentBooking[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

function getStoredFines(): Fine[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.FINES);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveFines(fines: Fine[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.FINES, JSON.stringify(fines));
}

let nextSlotId = 1;
let nextBookingId = 1;
let nextFineId = 1;

/**
 * Helper to generate available slots for the next 2 weeks
 */
function generateAvailableSlots(): AvailableSlot[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(today.getDate() + 14);

  const slots: AvailableSlot[] = [];
  
  // Expanded time slots - more variety throughout the day
  const theoreticalTimeSlots = [
    { start: "07:00", end: "08:00" },
    { start: "08:00", end: "09:00" },
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "13:00", end: "14:00" },
    { start: "17:00", end: "18:00" },
    { start: "18:00", end: "19:00" },
  ];

  const practicalTimeSlots = [
    { start: "08:00", end: "09:00" },
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "13:00", end: "14:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
    { start: "16:00", end: "17:00" },
    { start: "17:00", end: "18:00" },
  ];

  // All active teachers can teach both theoretical and practical classes
  const activeTeachers = mockTeachers.filter((t) => t.isActive);
  const theoreticalTeachers = activeTeachers;
  const practicalTeachers = activeTeachers;

  for (let d = new Date(today); d <= twoWeeksLater; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Generate theoretical slots (more on weekdays, fewer on weekends)
    if (!isWeekend || Math.random() > 0.5) {
      theoreticalTimeSlots.forEach((slot, index) => {
        // Skip some early/late slots on weekends
        if (isWeekend && (index === 0 || index === theoreticalTimeSlots.length - 1)) {
          if (Math.random() > 0.3) return; // 70% chance to skip
        }

        const teacher = theoreticalTeachers[index % theoreticalTeachers.length];
        const totalSpots = 5 + Math.floor(Math.random() * 3); // 5-7 spots
        const bookedSpots = Math.floor(Math.random() * Math.max(1, totalSpots - 1));
        const availableSpots = Math.max(1, totalSpots - bookedSpots);

        slots.push({
          id: String(nextSlotId++),
          date: dateStr,
          startTime: slot.start,
          endTime: slot.end,
          classType: "theoretical",
          teacherId: teacher.id,
          teacherName: teacher.name,
          availableSpots,
          totalSpots,
        });
      });
    }

    // Generate practical slots (available on weekdays and some weekends)
    if (!isWeekend || Math.random() > 0.4) {
      practicalTimeSlots.forEach((slot, index) => {
        // Skip some slots on weekends
        if (isWeekend && Math.random() > 0.6) return;

        const teacher = practicalTeachers[index % practicalTeachers.length];
        const totalSpots = 2 + Math.floor(Math.random() * 2); // 2-3 spots
        const bookedSpots = Math.floor(Math.random() * Math.max(0, totalSpots - 1));
        const availableSpots = Math.max(1, totalSpots - bookedSpots);

        slots.push({
          id: String(nextSlotId++),
          date: dateStr,
          startTime: slot.start,
          endTime: slot.end,
          classType: "practical",
          teacherId: teacher.id,
          teacherName: teacher.name,
          availableSpots,
          totalSpots,
        });
      });
    }
  }

  return slots;
}

/**
 * Initialize slots on first call
 */
function ensureSlotsGenerated(): AvailableSlot[] {
  const stored = getStoredSlots();
  if (stored.length === 0) {
    const slots = generateAvailableSlots();
    saveSlots(slots);
    return slots;
  }
  return stored;
}

/**
 * Seed some example bookings for a student
 */
function seedStudentBookings(studentId: string): void {
  const bookings = getStoredBookings();
  const existingBookings = bookings.filter((b) => b.studentId === studentId);
  if (existingBookings.length > 0) return;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Add a few example bookings
  const newBookings: StudentBooking[] = [
    {
      id: String(nextBookingId++),
      studentId,
      classType: "theoretical",
      date: tomorrow.toISOString().split("T")[0],
      startTime: "08:00",
      endTime: "09:00",
      teacherId: "1",
      teacherName: "John Smith",
      status: "scheduled",
      createdAt: today.toISOString(),
    },
    {
      id: String(nextBookingId++),
      studentId,
      classType: "practical",
      date: nextWeek.toISOString().split("T")[0],
      startTime: "14:00",
      endTime: "15:00",
      teacherId: "2",
      teacherName: "Maria Garcia",
      status: "scheduled",
      createdAt: today.toISOString(),
    },
  ];

  bookings.push(...newBookings);
  saveBookings(bookings);
}

/**
 * Seed some example fines for a student
 */
function seedStudentFines(studentId: string): void {
  const fines = getStoredFines();
  const existingFines = fines.filter((f) => f.studentId === studentId);
  if (existingFines.length > 0) return;

  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  const newFines: Fine[] = [
    {
      id: String(nextFineId++),
      studentId,
      reason: "Late cancellation (less than 24 hours notice)",
      date: lastMonth.toISOString().split("T")[0],
      amount: 50000,
      isPaid: false,
      createdAt: lastMonth.toISOString(),
    },
    {
      id: String(nextFineId++),
      studentId,
      reason: "No-show for scheduled class",
      date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      amount: 75000,
      isPaid: false,
      createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  fines.push(...newFines);
  saveFines(fines);
}

/**
 * GET /student/available-slots
 * Returns available class slots for the next 2 weeks
 */
export async function getAvailableSlots(
  classType?: ClassType
): Promise<ApiResponse<AvailableSlot[]>> {
  try {
    await simulateDelay();

    const errorCode = simulateRandomError(0.05);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    const slots = ensureSlotsGenerated();

    let filteredSlots = slots.filter((slot) => {
      const slotDate = new Date(slot.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const twoWeeksLater = new Date(today);
      twoWeeksLater.setDate(today.getDate() + 14);

      return slotDate >= today && slotDate <= twoWeeksLater && slot.availableSpots > 0;
    });

    if (classType) {
      filteredSlots = filteredSlots.filter((slot) => slot.classType === classType);
    }

    return createSuccessResponse(filteredSlots);
  } catch (error) {
    return handleError(error, "Failed to fetch available slots");
  }
}

/**
 * POST /student/book-class
 * Books a class for a student
 */
export async function bookClass(
  payload: BookClassPayload
): Promise<ApiResponse<StudentBooking>> {
  try {
    await simulateDelay();

    const { teacher_id, class_type_id, date, start_time, end_time } = payload;

    if (!teacher_id || !class_type_id || !date || !start_time || !end_time) {
      return handleError(
        "teacher_id, class_type_id, date, start_time, and end_time are required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Get current user's ID for mock mode
    let studentId: string;
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("driving-school-user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          studentId = user.id;
        } catch {
          return handleError(
            "User not authenticated",
            "Authentication failed",
            HttpErrorCode.UNAUTHORIZED
          );
        }
      } else {
        return handleError(
          "User not authenticated",
          "Authentication failed",
          HttpErrorCode.UNAUTHORIZED
        );
      }
    } else {
      return handleError(
        "User not authenticated",
        "Authentication failed",
        HttpErrorCode.UNAUTHORIZED
      );
    }

    const slots = ensureSlotsGenerated();
    const classType: ClassType = class_type_id === 1 ? "theoretical" : "practical";
    const slot = slots.find(
      (s) =>
        s.teacherId === String(teacher_id) &&
        s.classType === classType &&
        s.date === date &&
        s.startTime === start_time &&
        s.endTime === end_time
    );
    if (!slot) {
      return handleError(
        `Slot not found for the specified criteria`,
        "Slot not found",
        HttpErrorCode.NOT_FOUND
      );
    }

    if (slot.availableSpots <= 0) {
      return handleError(
        "No available spots remaining for this slot",
        "Slot full",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check if student already has a booking for this slot
    const bookings = getStoredBookings();
    const existingBooking = bookings.find(
      (b) =>
        b.studentId === studentId &&
        b.date === slot.date &&
        b.startTime === slot.startTime &&
        b.status === "scheduled"
    );

    if (existingBooking) {
      return handleError(
        "Student already has a booking for this time slot",
        "Duplicate booking",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check if slot is within 2 weeks
    const slotDate = new Date(slot.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);

    if (slotDate < today || slotDate > twoWeeksLater) {
      return handleError(
        "Cannot book classes outside the 2-week window",
        "Invalid date range",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Create booking
    const booking: StudentBooking = {
      id: String(nextBookingId++),
      studentId,
      classType: slot.classType,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      teacherId: slot.teacherId,
      teacherName: slot.teacherName,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    bookings.push(booking);
    saveBookings(bookings);

    // Update available spots
    slot.availableSpots -= 1;
    saveSlots(slots);

    return createSuccessResponse(booking);
  } catch (error) {
    return handleError(error, "Failed to book class");
  }
}

/**
 * GET /student/bookings
 * Returns all bookings for a student
 */
export async function getStudentBookings(
  studentId: string
): Promise<ApiResponse<StudentBooking[]>> {
  try {
    await simulateDelay();

    const errorCode = simulateRandomError(0.05);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    if (!studentId) {
      return handleError(
        "studentId is required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    seedStudentBookings(studentId);

    const bookings = getStoredBookings();
    const studentBookings = bookings.filter((b) => b.studentId === studentId);
    return createSuccessResponse(studentBookings);
  } catch (error) {
    return handleError(error, "Failed to fetch student bookings");
  }
}

/**
 * POST /student/cancel-booking
 * Cancels a student's booking
 */
export async function cancelBooking(
  payload: CancelBookingPayload
): Promise<ApiResponse<CancelBookingResponse>> {
  try {
    await simulateDelay();

    const { appointment_id } = payload;

    if (!appointment_id) {
      return handleError(
        "appointment_id is required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    const bookings = getStoredBookings();
    const booking = bookings.find((b) => b.id === String(appointment_id));

    if (!booking) {
      return handleError(
        `Booking with appointment_id ${appointment_id} not found`,
        "Booking not found",
        HttpErrorCode.NOT_FOUND
      );
    }

    if (booking.status === "cancelled") {
      return handleError(
        "Booking is already cancelled",
        "Already cancelled",
        HttpErrorCode.BAD_REQUEST
      );
    }

    if (booking.status === "completed") {
      return handleError(
        "Cannot cancel a completed class",
        "Cannot cancel completed class",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check if booking is in the past
    const bookingDate = new Date(`${booking.date}T${booking.startTime}`);
    const now = new Date();

    if (bookingDate < now) {
      return handleError(
        "Cannot cancel a past class",
        "Invalid cancellation",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Update booking status
    booking.status = "cancelled";
    booking.cancelledAt = new Date().toISOString();
    saveBookings(bookings);

    // Restore available spot
    const slots = ensureSlotsGenerated();
    const slot = slots.find(
      (s) =>
        s.date === booking.date &&
        s.startTime === booking.startTime &&
        s.classType === booking.classType
    );
    if (slot) {
      slot.availableSpots = Math.min(slot.availableSpots + 1, slot.totalSpots);
      saveSlots(slots);
    }

    return createSuccessResponse({
      id: parseInt(booking.id),
      status: "cancelled" as const,
      penalty_applied: false, // Mock doesn't apply penalties, backend will
    } as CancelBookingResponse);
  } catch (error) {
    return handleError(error, "Failed to cancel booking");
  }
}

/**
 * GET /student/fines
 * Returns all fines for a student
 */
export async function getStudentFines(
  studentId: string
): Promise<ApiResponse<Fine[]>> {
  try {
    await simulateDelay();

    const errorCode = simulateRandomError(0.05);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    if (!studentId) {
      return handleError(
        "studentId is required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    seedStudentFines(studentId);

    const fines = getStoredFines();
    const studentFines = fines.filter((f) => f.studentId === studentId);
    return createSuccessResponse(studentFines);
  } catch (error) {
    return handleError(error, "Failed to fetch student fines");
  }
}

/**
 * GET /student/debt
 * Returns total debt information for a student
 */
export async function getStudentDebt(
  studentId: string
): Promise<ApiResponse<StudentDebt>> {
  try {
    await simulateDelay();

    const errorCode = simulateRandomError(0.05);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    if (!studentId) {
      return handleError(
        "studentId is required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    seedStudentFines(studentId);

    const fines = getStoredFines();
    const studentFines = fines.filter((f) => f.studentId === studentId && !f.isPaid);
    const outstandingFines = studentFines.reduce((sum, fine) => sum + fine.amount, 0);

    // Mock pending payments (e.g., for upcoming classes)
    const pendingPayments = 150000; // Mock value

    const totalDebt = outstandingFines + pendingPayments;

    return createSuccessResponse({
      totalDebt,
      outstandingFines,
      pendingPayments,
      fines: studentFines,
    });
  } catch (error) {
    return handleError(error, "Failed to fetch student debt");
  }
}
