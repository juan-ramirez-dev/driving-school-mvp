/**
 * Mock API for Student Management
 * Simulates CRUD operations for students
 * Enforces maximum 1000 active students limit
 */

import {
  ApiResponse,
  HttpErrorCode,
  createSuccessResponse,
  handleError,
  simulateDelay,
  simulateRandomError,
} from "../utils/errorHandler";
import { notifyWarning } from "../utils/notifier";
import { Student } from "./types";

// Maximum active students limit
const MAX_ACTIVE_STUDENTS = 1000;

// In-memory mock data store
let students: Student[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    phone: "+1-555-1001",
    legalId: "ID-001",
    dateOfBirth: "2000-05-15",
    address: "123 Main St, City, State",
    isActive: true,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z",
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
    createdAt: "2024-01-12T09:30:00Z",
    updatedAt: "2024-01-12T09:30:00Z",
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol.davis@email.com",
    phone: "+1-555-1003",
    legalId: "ID-003",
    dateOfBirth: "2001-03-10",
    address: "789 Pine Rd, City, State",
    isActive: false,
    createdAt: "2023-12-05T10:15:00Z",
    updatedAt: "2024-02-15T14:20:00Z",
  },
];

let nextId = 4;

/**
 * Helper function to count active students
 */
function getActiveStudentCount(): number {
  return students.filter((s) => s.isActive).length;
}

/**
 * Helper function to check if student limit is reached
 */
function checkStudentLimit(): boolean {
  const activeCount = getActiveStudentCount();
  if (activeCount >= MAX_ACTIVE_STUDENTS) {
    notifyWarning(
      `Maximum active student limit reached (${MAX_ACTIVE_STUDENTS}). Cannot add more active students.`
    );
    return true;
  }
  return false;
}

/**
 * GET /students
 * Returns a list of all students
 */
export async function getStudents(): Promise<ApiResponse<Student[]>> {
  try {
    await simulateDelay();

    // Simulate random errors (10% chance)
    const errorCode = simulateRandomError(0.1);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    return createSuccessResponse(students);
  } catch (error) {
    return handleError(error, "Failed to fetch students");
  }
}

/**
 * POST /students
 * Creates a new student
 * Enforces maximum 1000 active students limit
 */
export async function createStudent(
  data: Omit<Student, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<ApiResponse<Student>> {
  try {
    await simulateDelay();

    // Validation
    if (!data.name || !data.email || !data.legalId) {
      return handleError(
        "Name, email, and legal ID are required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check for duplicate email
    if (students.some((s) => s.email === data.email)) {
      return handleError(
        "Student with this email already exists",
        "Duplicate entry",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check for duplicate legal ID
    if (students.some((s) => s.legalId === data.legalId)) {
      return handleError(
        "Student with this legal ID already exists",
        "Duplicate entry",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check student limit if creating as active
    // Note: We assume new students are created as active by default
    if (checkStudentLimit()) {
      return handleError(
        `Maximum active student limit reached (${MAX_ACTIVE_STUDENTS}). Cannot add more active students.`,
        "Limit exceeded",
        HttpErrorCode.BAD_REQUEST
      );
    }

    const now = new Date().toISOString();
    const newStudent: Student = {
      ...data,
      id: String(nextId++),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    students.push(newStudent);
    return createSuccessResponse(newStudent);
  } catch (error) {
    return handleError(error, "Failed to create student");
  }
}

/**
 * PUT /students/:id
 * Updates an existing student
 * Enforces maximum 1000 active students limit when reactivating
 */
export async function updateStudent(
  id: string,
  data: Partial<Omit<Student, "id" | "createdAt">>
): Promise<ApiResponse<Student>> {
  try {
    await simulateDelay();

    const studentIndex = students.findIndex((s) => s.id === id);
    if (studentIndex === -1) {
      return handleError(
        `Student with id ${id} not found`,
        "Student not found",
        HttpErrorCode.NOT_FOUND
      );
    }

    const currentStudent = students[studentIndex];

    // Check for duplicate email if email is being updated
    if (
      data.email &&
      students.some((s) => s.id !== id && s.email === data.email)
    ) {
      return handleError(
        "Student with this email already exists",
        "Duplicate entry",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check for duplicate legal ID if legal ID is being updated
    if (
      data.legalId &&
      students.some((s) => s.id !== id && s.legalId === data.legalId)
    ) {
      return handleError(
        "Student with this legal ID already exists",
        "Duplicate entry",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check student limit if reactivating an inactive student
    if (
      !currentStudent.isActive &&
      data.isActive === true &&
      checkStudentLimit()
    ) {
      return handleError(
        `Maximum active student limit reached (${MAX_ACTIVE_STUDENTS}). Cannot reactivate this student.`,
        "Limit exceeded",
        HttpErrorCode.BAD_REQUEST
      );
    }

    const updatedStudent: Student = {
      ...currentStudent,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    students[studentIndex] = updatedStudent;
    return createSuccessResponse(updatedStudent);
  } catch (error) {
    return handleError(error, "Failed to update student");
  }
}

/**
 * DELETE /students/:id
 * Marks a student as inactive (soft delete)
 */
export async function deleteStudent(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  try {
    await simulateDelay();

    const studentIndex = students.findIndex((s) => s.id === id);
    if (studentIndex === -1) {
      return handleError(
        `Student with id ${id} not found`,
        "Student not found",
        HttpErrorCode.NOT_FOUND
      );
    }

    students[studentIndex] = {
      ...students[studentIndex],
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    return createSuccessResponse({
      message: `Student ${id} has been marked as inactive`,
    });
  } catch (error) {
    return handleError(error, "Failed to delete student");
  }
}
