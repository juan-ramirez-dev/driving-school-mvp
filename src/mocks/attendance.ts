/**
 * Mock API for Teacher Classes and Attendance
 * Simulates theoretical and practical classes, attendance, and cancellations
 */

import {
  ApiResponse,
  HttpErrorCode,
  createSuccessResponse,
  handleError,
  simulateDelay,
  simulateRandomError,
} from "../utils/errorHandler";
import type { Student } from "./types";

export type ClassType = "theoretical" | "practical";

export type AttendanceStatus = "pending" | "attended" | "absent";

export interface TheoreticalClassStudent {
  studentId: string;
  name: string;
  legalId: string;
  attendanceStatus: AttendanceStatus;
}

export interface TheoreticalClass {
  id: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  students: TheoreticalClassStudent[];
  canCancelWithoutReason: boolean;
  isCancelled: boolean;
}

export interface PracticalClass {
  id: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  student: {
    studentId: string;
    name: string;
    legalId: string;
    phone: string;
  };
  vehicleType?: string;
  attendanceStatus: AttendanceStatus;
  canCancelWithoutReason: boolean;
  isCancelled: boolean;
}

export interface TeacherClassesResponse {
  theoreticalClasses: TheoreticalClass[];
  practicalClasses: PracticalClass[];
}

// In-memory mock data stores
let theoreticalClasses: TheoreticalClass[] = [];
let practicalClasses: PracticalClass[] = [];

let nextClassId = 1;

/**
 * Helper to seed some example classes for a teacher on a given date
 */
function seedClassesForDate(teacherId: string, date: string): void {
  const alreadySeeded = theoreticalClasses.some(
    (cls) => cls.teacherId === teacherId && cls.date === date
  );

  if (alreadySeeded) return;

  // Example students
  const exampleStudents: Student[] = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice.johnson@email.com",
      phone: "+1-555-1001",
      legalId: "ID-001",
      dateOfBirth: "2000-05-15",
      address: "123 Main St, City, State",
      isActive: true,
      createdAt: `${date}T08:00:00Z`,
      updatedAt: `${date}T08:00:00Z`,
    },
    {
      id: "2",
      name: "Bob Williams",
      email: "bob.williams@email.com",
      phone: "+1-555-1002",
      legalId: "ID-002",
      dateOfBirth: "1999-08-22",
      address: "456 Oak Ave, City, State",
      isActive: true,
      createdAt: `${date}T08:00:00Z`,
      updatedAt: `${date}T08:00:00Z`,
    },
    {
      id: "3",
      name: "Carol Davis",
      email: "carol.davis@email.com",
      phone: "+1-555-1003",
      legalId: "ID-003",
      dateOfBirth: "2001-03-10",
      address: "789 Pine Rd, City, State",
      isActive: true,
      createdAt: `${date}T08:00:00Z`,
      updatedAt: `${date}T08:00:00Z`,
    },
  ];

  // Seed theoretical classes: 08–09, 09–10, 10–11
  const theoreticalSlots = [
    { startTime: "08:00", endTime: "09:00" },
    { startTime: "09:00", endTime: "10:00" },
    { startTime: "10:00", endTime: "11:00" },
  ];

  theoreticalSlots.forEach((slot, index) => {
    const studentsForSlot = exampleStudents
      .filter((_, i) => i !== index) // simple variation per slot
      .map((s) => ({
        studentId: s.id,
        name: s.name,
        legalId: s.legalId,
        attendanceStatus: "pending" as AttendanceStatus,
      }));

    theoreticalClasses.push({
      id: String(nextClassId++),
      teacherId,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      students: studentsForSlot,
      canCancelWithoutReason: index === 0, // first slot can cancel directly
      isCancelled: false,
    });
  });

  // Seed practical classes: each student has a practical session
  exampleStudents.forEach((student, index) => {
    practicalClasses.push({
      id: String(nextClassId++),
      teacherId,
      date,
      startTime: `14:0${index}`,
      endTime: `15:0${index}`,
      student: {
        studentId: student.id,
        name: student.name,
        legalId: student.legalId,
        phone: student.phone,
      },
      vehicleType: index % 2 === 0 ? "Manual" : "Automatic",
      attendanceStatus: "pending",
      canCancelWithoutReason: index === 0,
      isCancelled: false,
    });
  });
}

/**
 * GET /teacher/classes
 * Returns theoretical and practical classes for a teacher and date
 */
export async function getTeacherClasses(
  teacherId: string,
  date: string
): Promise<ApiResponse<TeacherClassesResponse>> {
  try {
    await simulateDelay();

    const errorCode = simulateRandomError(0.05);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    if (!teacherId || !date) {
      return handleError(
        "Teacher ID and date are required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Seed data if needed
    seedClassesForDate(teacherId, date);

    const theoretical = theoreticalClasses.filter(
      (cls) => cls.teacherId === teacherId && cls.date === date
    );
    const practical = practicalClasses.filter(
      (cls) => cls.teacherId === teacherId && cls.date === date
    );

    return createSuccessResponse({
      theoreticalClasses: theoretical,
      practicalClasses: practical,
    });
  } catch (error) {
    return handleError(error, "Failed to fetch teacher classes");
  }
}

export interface UpdateAttendancePayload {
  classId: string;
  classType: ClassType;
  studentId: string;
  status: AttendanceStatus;
}

/**
 * POST /teacher/classes/attendance
 * Updates attendance status for a student in a class
 */
export async function updateAttendance(
  payload: UpdateAttendancePayload
): Promise<ApiResponse<{ message: string }>> {
  try {
    await simulateDelay();

    const { classId, classType, studentId, status } = payload;

    if (!classId || !classType || !studentId || !status) {
      return handleError(
        "classId, classType, studentId, and status are required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    if (classType === "theoretical") {
      const cls = theoreticalClasses.find((c) => c.id === classId);
      if (!cls) {
        return handleError(
          `Theoretical class with id ${classId} not found`,
          "Class not found",
          HttpErrorCode.NOT_FOUND
        );
      }

      const student = cls.students.find((s) => s.studentId === studentId);
      if (!student) {
        return handleError(
          `Student with id ${studentId} not found in class`,
          "Student not found",
          HttpErrorCode.NOT_FOUND
        );
      }

      student.attendanceStatus = status;
    } else {
      const cls = practicalClasses.find((c) => c.id === classId);
      if (!cls) {
        return handleError(
          `Practical class with id ${classId} not found`,
          "Class not found",
          HttpErrorCode.NOT_FOUND
        );
      }

      if (cls.student.studentId !== studentId) {
        return handleError(
          `Student with id ${studentId} not found in practical class`,
          "Student not found",
          HttpErrorCode.NOT_FOUND
        );
      }

      cls.attendanceStatus = status;
    }

    return createSuccessResponse({
      message: "Attendance updated successfully",
    });
  } catch (error) {
    return handleError(error, "Failed to update attendance");
  }
}

export interface CancelClassPayload {
  classId: string;
  classType: ClassType;
  teacherHasPermission: boolean;
  reason?: string;
}

/**
 * POST /teacher/classes/cancel
 * Cancels a class (with optional justification)
 */
export async function cancelClass(
  payload: CancelClassPayload
): Promise<ApiResponse<{ message: string }>> {
  try {
    await simulateDelay();

    const { classId, classType, teacherHasPermission, reason } = payload;

    if (!classId || !classType) {
      return handleError(
        "classId and classType are required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    if (!teacherHasPermission && !reason) {
      return handleError(
        "Cancellation reason is required when teacher lacks permission",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    if (classType === "theoretical") {
      const cls = theoreticalClasses.find((c) => c.id === classId);
      if (!cls) {
        return handleError(
          `Theoretical class with id ${classId} not found`,
          "Class not found",
          HttpErrorCode.NOT_FOUND
        );
      }

      cls.isCancelled = true;
    } else {
      const cls = practicalClasses.find((c) => c.id === classId);
      if (!cls) {
        return handleError(
          `Practical class with id ${classId} not found`,
          "Class not found",
          HttpErrorCode.NOT_FOUND
        );
      }

      cls.isCancelled = true;
    }

    return createSuccessResponse({
      message: "Class cancelled successfully",
    });
  } catch (error) {
    return handleError(error, "Failed to cancel class");
  }
}

