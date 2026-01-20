/**
 * Mock API for Vehicle Management
 * Simulates CRUD operations for vehicles
 */

import {
  ApiResponse,
  HttpErrorCode,
  createSuccessResponse,
  handleError,
  simulateDelay,
  simulateRandomError,
} from "../utils/errorHandler";
import { Vehicle } from "./types";

// In-memory mock data store
let vehicles: Vehicle[] = [
  {
    id: "1",
    licensePlate: "ABC-123",
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    color: "White",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    licensePlate: "XYZ-789",
    brand: "Honda",
    model: "Civic",
    year: 2021,
    color: "Black",
    isActive: true,
    createdAt: "2025-02-20T14:30:00Z",
    updatedAt: "2025-02-20T14:30:00Z",
  },
  {
    id: "3",
    licensePlate: "DEF-456",
    brand: "Ford",
    model: "Focus",
    year: 2019,
    color: "Red",
    isActive: false,
    createdAt: "2023-11-10T09:15:00Z",
    updatedAt: "2025-03-05T16:45:00Z",
  },
];

let nextId = 4;

/**
 * GET /vehicles
 * Returns a list of all vehicles
 */
export async function getVehicles(): Promise<ApiResponse<Vehicle[]>> {
  try {
    await simulateDelay();

    // Simulate random errors (10% chance)
    const errorCode = simulateRandomError(0.1);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    return createSuccessResponse(vehicles);
  } catch (error) {
    return handleError(error, "Failed to fetch vehicles");
  }
}

/**
 * POST /vehicles
 * Creates a new vehicle
 */
export async function createVehicle(
  data: Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<ApiResponse<Vehicle>> {
  try {
    await simulateDelay();

    // Validation
    if (!data.licensePlate || !data.brand || !data.model) {
      return handleError(
        "License plate, brand, and model are required",
        "Validation failed",
        HttpErrorCode.BAD_REQUEST
      );
    }

    // Check for duplicate license plate
    if (vehicles.some((v) => v.licensePlate === data.licensePlate)) {
      return handleError(
        "Vehicle with this license plate already exists",
        "Duplicate entry",
        HttpErrorCode.BAD_REQUEST
      );
    }

    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      ...data,
      id: String(nextId++),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    vehicles.push(newVehicle);
    return createSuccessResponse(newVehicle);
  } catch (error) {
    return handleError(error, "Failed to create vehicle");
  }
}

/**
 * PUT /vehicles/:id
 * Updates an existing vehicle
 */
export async function updateVehicle(
  id: string,
  data: Partial<Omit<Vehicle, "id" | "createdAt">>
): Promise<ApiResponse<Vehicle>> {
  try {
    await simulateDelay();

    const vehicleIndex = vehicles.findIndex((v) => v.id === id);
    if (vehicleIndex === -1) {
      return handleError(
        `Vehicle with id ${id} not found`,
        "Vehicle not found",
        HttpErrorCode.NOT_FOUND
      );
    }

    // Check for duplicate license plate if license plate is being updated
    if (
      data.licensePlate &&
      vehicles.some(
        (v) => v.id !== id && v.licensePlate === data.licensePlate
      )
    ) {
      return handleError(
        "Vehicle with this license plate already exists",
        "Duplicate entry",
        HttpErrorCode.BAD_REQUEST
      );
    }

    const updatedVehicle: Vehicle = {
      ...vehicles[vehicleIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    vehicles[vehicleIndex] = updatedVehicle;
    return createSuccessResponse(updatedVehicle);
  } catch (error) {
    return handleError(error, "Failed to update vehicle");
  }
}

/**
 * DELETE /vehicles/:id
 * Marks a vehicle as inactive (soft delete)
 */
export async function deleteVehicle(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  try {
    await simulateDelay();

    const vehicleIndex = vehicles.findIndex((v) => v.id === id);
    if (vehicleIndex === -1) {
      return handleError(
        `Vehicle with id ${id} not found`,
        "Vehicle not found",
        HttpErrorCode.NOT_FOUND
      );
    }

    vehicles[vehicleIndex] = {
      ...vehicles[vehicleIndex],
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    return createSuccessResponse({
      message: `Vehicle ${id} has been marked as inactive`,
    });
  } catch (error) {
    return handleError(error, "Failed to delete vehicle");
  }
}
