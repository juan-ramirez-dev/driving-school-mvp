/**
 * Mock API for Classroom Management
 * Simulates CRUD operations for classrooms
 */

import {
  ApiResponse,
  HttpErrorCode,
  createSuccessResponse,
  handleError,
  simulateDelay,
  simulateRandomError,
} from "../utils/errorHandler";
import { Classroom } from "./types";

// In-memory mock data store
let classrooms: Classroom[] = [
  {
    id: "1",
    name: "Classroom A",
    capacity: 30,
    location: "Building 1, Floor 2",
    equipment: ["Projector", "Whiteboard", "Computers"],
    isActive: true,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "2",
    name: "Classroom B",
    capacity: 25,
    location: "Building 1, Floor 2",
    equipment: ["Projector", "Whiteboard"],
    isActive: true,
    createdAt: "2024-01-12T09:30:00Z",
    updatedAt: "2024-01-12T09:30:00Z",
  },
  {
    id: "3",
    name: "Classroom C",
    capacity: 20,
    location: "Building 2, Floor 1",
    equipment: ["Whiteboard"],
    isActive: false,
    createdAt: "2023-12-05T10:15:00Z",
    updatedAt: "2024-02-15T14:20:00Z",
  },
];

let nextId = 4;

/**
 * GET /classrooms
 * Returns a list of all classrooms
 */
export async function getClassrooms(): Promise<ApiResponse<Classroom[]>> {
  try {
    await simulateDelay();

    // Simulate random errors (10% chance)
    const errorCode = simulateRandomError(0.1);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    return createSuccessResponse(classrooms);
  } catch (error) {
    return handleError(error, "Failed to fetch classrooms");
  }
}

/**
 * POST /classrooms
 * Creates a new classroom
 */
export async function createClassroom(
  data: Omit<Classroom, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<ApiResponse<Classroom>> {
  try {
    await simulateDelay();

    // Validation
    if (!data.name || !data.location || data.capacity === undefined) {
      return handleError(
        "Name, location, and capacity are required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    if (data.capacity <= 0) {
      return handleError(
        "Capacity must be greater than 0",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check for duplicate name
    if (classrooms.some((c) => c.name === data.name)) {
      return handleError(
        "Classroom with this name already exists",
        "Duplicate entry",
        HttpErrorCode.BAD_REQUEST
      );
    }

    const now = new Date().toISOString();
    const newClassroom: Classroom = {
      ...data,
      id: String(nextId++),
      isActive: true,
      equipment: data.equipment || [],
      createdAt: now,
      updatedAt: now,
    };

    classrooms.push(newClassroom);
    return createSuccessResponse(newClassroom);
  } catch (error) {
    return handleError(error, "Failed to create classroom");
  }
}

/**
 * PUT /classrooms/:id
 * Updates an existing classroom
 */
export async function updateClassroom(
  id: string,
  data: Partial<Omit<Classroom, "id" | "createdAt">>
): Promise<ApiResponse<Classroom>> {
  try {
    await simulateDelay();

    const classroomIndex = classrooms.findIndex((c) => c.id === id);
    if (classroomIndex === -1) {
      return handleError(
        `Classroom with id ${id} not found`,
        "Classroom not found",
        HttpErrorCode.NOT_FOUND
      );
    }

    // Validate capacity if being updated
    if (data.capacity !== undefined && data.capacity <= 0) {
      return handleError(
        "Capacity must be greater than 0",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check for duplicate name if name is being updated
    if (
      data.name &&
      classrooms.some((c) => c.id !== id && c.name === data.name)
    ) {
      return handleError(
        "Classroom with this name already exists",
        "Duplicate entry",
        HttpErrorCode.BAD_REQUEST
      );
    }

    const updatedClassroom: Classroom = {
      ...classrooms[classroomIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    classrooms[classroomIndex] = updatedClassroom;
    return createSuccessResponse(updatedClassroom);
  } catch (error) {
    return handleError(error, "Failed to update classroom");
  }
}

/**
 * DELETE /classrooms/:id
 * Marks a classroom as inactive (soft delete)
 */
export async function deleteClassroom(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  try {
    await simulateDelay();

    const classroomIndex = classrooms.findIndex((c) => c.id === id);
    if (classroomIndex === -1) {
      return handleError(
        `Classroom with id ${id} not found`,
        "Classroom not found",
        HttpErrorCode.NOT_FOUND
      );
    }

    classrooms[classroomIndex] = {
      ...classrooms[classroomIndex],
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    return createSuccessResponse({
      message: `Classroom ${id} has been marked as inactive`,
    });
  } catch (error) {
    return handleError(error, "Failed to delete classroom");
  }
}
