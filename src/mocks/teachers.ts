/**
 * Mock API for Teacher Management and Availability
 * Simulates CRUD operations for teachers and availability management
 */

import {
  ApiResponse,
  HttpErrorCode,
  createSuccessResponse,
  handleError,
  simulateDelay,
  simulateRandomError,
} from "../utils/errorHandler";
import { Teacher, TeacherAvailability, TimeBlockSize } from "./types";

// In-memory mock data store
let teachers: Teacher[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@drivingschool.com",
    phone: "+1-555-0101",
    licenseNumber: "TCH-001",
    specialization: ["Practical", "Highway"],
    isActive: true,
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-05T08:00:00Z",
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "maria.garcia@drivingschool.com",
    phone: "+1-555-0102",
    licenseNumber: "TCH-002",
    specialization: ["Theoretical", "Practical"],
    isActive: true,
    createdAt: "2024-01-08T09:15:00Z",
    updatedAt: "2024-01-08T09:15:00Z",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.johnson@drivingschool.com",
    phone: "+1-555-0103",
    licenseNumber: "TCH-003",
    specialization: ["Practical"],
    isActive: false,
    createdAt: "2023-12-10T10:30:00Z",
    updatedAt: "2024-02-20T16:45:00Z",
  },
];

let teacherAvailability: TeacherAvailability[] = [];

let nextId = 4;

/**
 * Helper function to generate time slots based on block size
 */
function generateTimeSlots(
  startTime: string,
  endTime: string,
  blockSize: TimeBlockSize
): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  const blockMinutes: Record<TimeBlockSize, number> = {
    "15min": 15,
    "30min": 30,
    "1h": 60,
    "2h": 120,
  };

  const blockSizeMinutes = blockMinutes[blockSize];

  for (let minutes = startMinutes; minutes < endMinutes; minutes += blockSizeMinutes) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    slots.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }

  return slots;
}

/**
 * GET /teachers
 * Returns a list of all teachers
 */
export async function getTeachers(): Promise<ApiResponse<Teacher[]>> {
  try {
    await simulateDelay();

    // Simulate random errors (10% chance)
    const errorCode = simulateRandomError(0.1);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    return createSuccessResponse(teachers);
  } catch (error) {
    return handleError(error, "Failed to fetch teachers");
  }
}

/**
 * POST /teachers
 * Creates a new teacher
 */
export async function createTeacher(
  data: Omit<Teacher, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<ApiResponse<Teacher>> {
  try {
    await simulateDelay();

    // Validation
    if (!data.name || !data.email || !data.licenseNumber) {
      return handleError(
        "Name, email, and license number are required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check for duplicate email
    if (teachers.some((t) => t.email === data.email)) {
      return handleError(
        "Teacher with this email already exists",
        "Duplicate entry",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check for duplicate license number
    if (teachers.some((t) => t.licenseNumber === data.licenseNumber)) {
      return handleError(
        "Teacher with this license number already exists",
        "Duplicate entry",
        HttpErrorCode.BAD_REQUEST
      );
    }

    const now = new Date().toISOString();
    const newTeacher: Teacher = {
      ...data,
      id: String(nextId++),
      isActive: true,
      specialization: data.specialization || [],
      createdAt: now,
      updatedAt: now,
    };

    teachers.push(newTeacher);
    return createSuccessResponse(newTeacher);
  } catch (error) {
    return handleError(error, "Failed to create teacher");
  }
}

/**
 * PUT /teachers/:id
 * Updates an existing teacher
 */
export async function updateTeacher(
  id: string,
  data: Partial<Omit<Teacher, "id" | "createdAt">>
): Promise<ApiResponse<Teacher>> {
  try {
    await simulateDelay();

    const teacherIndex = teachers.findIndex((t) => t.id === id);
    if (teacherIndex === -1) {
      return handleError(
        `Teacher with id ${id} not found`,
        "Teacher not found",
        HttpErrorCode.NOT_FOUND
      );
    }

    // Check for duplicate email if email is being updated
    if (
      data.email &&
      teachers.some((t) => t.id !== id && t.email === data.email)
    ) {
      return handleError(
        "Teacher with this email already exists",
        "Duplicate entry",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check for duplicate license number if license number is being updated
    if (
      data.licenseNumber &&
      teachers.some(
        (t) => t.id !== id && t.licenseNumber === data.licenseNumber
      )
    ) {
      return handleError(
        "Teacher with this license number already exists",
        "Duplicate entry",
        HttpErrorCode.BAD_REQUEST
      );
    }

    const updatedTeacher: Teacher = {
      ...teachers[teacherIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    teachers[teacherIndex] = updatedTeacher;
    return createSuccessResponse(updatedTeacher);
  } catch (error) {
    return handleError(error, "Failed to update teacher");
  }
}

/**
 * DELETE /teachers/:id
 * Marks a teacher as inactive (soft delete)
 */
export async function deleteTeacher(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  try {
    await simulateDelay();

    const teacherIndex = teachers.findIndex((t) => t.id === id);
    if (teacherIndex === -1) {
      return handleError(
        `Teacher with id ${id} not found`,
        "Teacher not found",
        HttpErrorCode.NOT_FOUND
      );
    }

    teachers[teacherIndex] = {
      ...teachers[teacherIndex],
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    return createSuccessResponse({
      message: `Teacher ${id} has been marked as inactive`,
    });
  } catch (error) {
    return handleError(error, "Failed to delete teacher");
  }
}

/**
 * GET /teachers/availability
 * Retrieves teacher availability data
 */
export async function getTeacherAvailability(): Promise<
  ApiResponse<TeacherAvailability[]>
> {
  try {
    await simulateDelay();

    // Simulate random errors (10% chance)
    const errorCode = simulateRandomError(0.1);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    return createSuccessResponse(teacherAvailability);
  } catch (error) {
    return handleError(error, "Failed to fetch teacher availability");
  }
}

/**
 * POST /teachers/availability
 * Sets teacher availability by time blocks
 */
export async function setTeacherAvailability(
  data: Omit<TeacherAvailability, "availableSlots">
): Promise<ApiResponse<TeacherAvailability>> {
  try {
    await simulateDelay();

    // Validation
    if (!data.teacherId || !data.date || !data.startTime || !data.endTime || !data.blockSize) {
      return handleError(
        "Teacher ID, date, start time, end time, and block size are required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Validate teacher exists
    const teacher = teachers.find((t) => t.id === data.teacherId);
    if (!teacher) {
      return handleError(
        `Teacher with id ${data.teacherId} not found`,
        "Teacher not found",
        HttpErrorCode.NOT_FOUND
      );
    }

    // Validate time format and range
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
      return handleError(
        "Invalid time format. Use HH:mm format",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Generate time slots
    const availableSlots = generateTimeSlots(
      data.startTime,
      data.endTime,
      data.blockSize
    );

    // Check if availability already exists for this teacher and date
    const existingIndex = teacherAvailability.findIndex(
      (a) => a.teacherId === data.teacherId && a.date === data.date
    );

    const availability: TeacherAvailability = {
      ...data,
      availableSlots,
    };

    if (existingIndex !== -1) {
      // Update existing availability
      teacherAvailability[existingIndex] = availability;
    } else {
      // Create new availability
      teacherAvailability.push(availability);
    }

    return createSuccessResponse(availability);
  } catch (error) {
    return handleError(error, "Failed to set teacher availability");
  }
}
