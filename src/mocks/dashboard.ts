/**
 * Mock API for Dashboard Statistics
 * Simulates dashboard data endpoints
 */

import {
  ApiResponse,
  HttpErrorCode,
  createSuccessResponse,
  handleError,
  simulateDelay,
  simulateRandomError,
} from "../utils/errorHandler";
import { DashboardStats, Reservation, RUNTExportData } from "./types";

// Mock reservations data
const mockReservations: Reservation[] = [
  {
    id: "1",
    studentId: "1",
    teacherId: "1",
    vehicleId: "1",
    date: "2024-02-15",
    startTime: "09:00",
    endTime: "11:00",
    status: "completed",
    createdAt: "2024-02-10T10:00:00Z",
    completedAt: "2024-02-15T11:00:00Z",
  },
  {
    id: "2",
    studentId: "2",
    teacherId: "1",
    vehicleId: "1",
    date: "2024-02-16",
    startTime: "14:00",
    endTime: "16:00",
    status: "completed",
    createdAt: "2024-02-11T09:30:00Z",
    completedAt: "2024-02-16T16:00:00Z",
  },
  {
    id: "3",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2024-02-20",
    startTime: "10:00",
    endTime: "12:00",
    status: "confirmed",
    createdAt: "2024-02-12T11:00:00Z",
  },
  {
    id: "4",
    studentId: "2",
    teacherId: "2",
    date: "2024-01-25",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    createdAt: "2024-01-20T08:00:00Z",
    completedAt: "2024-01-25T10:00:00Z",
  },
];

/**
 * Helper function to get last month's date range
 */
function getLastMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    start: lastMonth,
    end: thisMonth,
  };
}

/**
 * GET /dashboard/active-students
 * Returns count of active students
 */
export async function getActiveStudentsCount(): Promise<
  ApiResponse<{ count: number }>
> {
  try {
    await simulateDelay();

    // Simulate random errors (10% chance)
    const errorCode = simulateRandomError(0.1);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    // Mock active students count (in real implementation, this would query the database)
    const count = 847; // Mock value

    return createSuccessResponse({ count });
  } catch (error) {
    return handleError(error, "Failed to fetch active students count");
  }
}

/**
 * GET /dashboard/last-month-reservations
 * Returns last month's reservations count
 */
export async function getLastMonthReservations(): Promise<
  ApiResponse<{ count: number; reservations: Reservation[] }>
> {
  try {
    await simulateDelay();

    // Simulate random errors (10% chance)
    const errorCode = simulateRandomError(0.1);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    const { start, end } = getLastMonthRange();

    // Filter reservations from last month
    const lastMonthReservations = mockReservations.filter((reservation) => {
      const reservationDate = new Date(reservation.date);
      return reservationDate >= start && reservationDate < end;
    });

    return createSuccessResponse({
      count: lastMonthReservations.length,
      reservations: lastMonthReservations,
    });
  } catch (error) {
    return handleError(error, "Failed to fetch last month reservations");
  }
}

/**
 * GET /dashboard/completed-reservations?teacher=:id
 * Returns completed reservations, optionally filtered by teacher
 */
export async function getCompletedReservations(
  teacherId?: string
): Promise<ApiResponse<{ count: number; reservations: Reservation[] }>> {
  try {
    await simulateDelay();

    // Simulate random errors (10% chance)
    const errorCode = simulateRandomError(0.1);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    // Filter completed reservations
    let completedReservations = mockReservations.filter(
      (r) => r.status === "completed"
    );

    // Filter by teacher if teacherId is provided
    if (teacherId) {
      completedReservations = completedReservations.filter(
        (r) => r.teacherId === teacherId
      );
    }

    return createSuccessResponse({
      count: completedReservations.length,
      reservations: completedReservations,
    });
  } catch (error) {
    return handleError(error, "Failed to fetch completed reservations");
  }
}

/**
 * GET /dashboard/export-runt
 * Returns exportable RUNT format data
 * RUNT (Registro Único Nacional de Tránsito) is a Colombian traffic registry format
 */
export async function exportRUNT(): Promise<ApiResponse<RUNTExportData>> {
  try {
    await simulateDelay();

    // Simulate random errors (10% chance)
    const errorCode = simulateRandomError(0.1);
    if (errorCode) {
      throw new Error(`Simulated ${errorCode} error`);
    }

    // Mock RUNT export data
    const runtData: RUNTExportData = {
      exportDate: new Date().toISOString(),
      students: [
        {
          legalId: "ID-001",
          name: "Alice Johnson",
          completedClasses: 15,
          status: "Active",
        },
        {
          legalId: "ID-002",
          name: "Bob Williams",
          completedClasses: 12,
          status: "Active",
        },
      ],
      teachers: [
        {
          licenseNumber: "TCH-001",
          name: "John Smith",
          classesTaught: 245,
        },
        {
          licenseNumber: "TCH-002",
          name: "Maria Garcia",
          classesTaught: 198,
        },
      ],
      vehicles: [
        {
          licensePlate: "ABC-123",
          brand: "Toyota",
          model: "Corolla",
        },
        {
          licensePlate: "XYZ-789",
          brand: "Honda",
          model: "Civic",
        },
      ],
    };

    return createSuccessResponse(runtData);
  } catch (error) {
    return handleError(error, "Failed to export RUNT data");
  }
}
