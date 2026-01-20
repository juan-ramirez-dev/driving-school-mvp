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
  // Teacher 1 (John Smith) - February 2025
  {
    id: "1",
    studentId: "1",
    teacherId: "1",
    vehicleId: "1",
    date: "2025-02-15",
    startTime: "09:00",
    endTime: "11:00",
    status: "completed",
    createdAt: "2025-02-10T10:00:00Z",
    completedAt: "2025-02-15T11:00:00Z",
  },
  {
    id: "2",
    studentId: "2",
    teacherId: "1",
    vehicleId: "1",
    date: "2025-02-16",
    startTime: "14:00",
    endTime: "16:00",
    status: "completed",
    createdAt: "2025-02-11T09:30:00Z",
    completedAt: "2025-02-16T16:00:00Z",
  },
  {
    id: "5",
    studentId: "1",
    teacherId: "1",
    vehicleId: "1",
    date: "2025-02-18",
    startTime: "10:00",
    endTime: "12:00",
    status: "completed",
    createdAt: "2025-02-13T08:00:00Z",
    completedAt: "2025-02-18T12:00:00Z",
  },
  {
    id: "6",
    studentId: "2",
    teacherId: "1",
    vehicleId: "2",
    date: "2025-02-20",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    createdAt: "2025-02-15T09:00:00Z",
    completedAt: "2025-02-20T10:00:00Z",
  },
  {
    id: "7",
    studentId: "1",
    teacherId: "1",
    vehicleId: "1",
    date: "2025-02-22",
    startTime: "13:00",
    endTime: "15:00",
    status: "completed",
    createdAt: "2025-02-17T10:00:00Z",
    completedAt: "2025-02-22T15:00:00Z",
  },
  {
    id: "8",
    studentId: "2",
    teacherId: "1",
    vehicleId: "2",
    date: "2025-02-25",
    startTime: "09:00",
    endTime: "11:00",
    status: "completed",
    createdAt: "2025-02-20T08:00:00Z",
    completedAt: "2025-02-25T11:00:00Z",
  },
  {
    id: "9",
    studentId: "1",
    teacherId: "1",
    vehicleId: "1",
    date: "2025-02-27",
    startTime: "14:00",
    endTime: "16:00",
    status: "completed",
    createdAt: "2025-02-22T09:00:00Z",
    completedAt: "2025-02-27T16:00:00Z",
  },
  // Teacher 1 (John Smith) - March 2025
  {
    id: "10",
    studentId: "1",
    teacherId: "1",
    vehicleId: "1",
    date: "2025-03-01",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    createdAt: "2025-02-25T10:00:00Z",
    completedAt: "2025-03-01T10:00:00Z",
  },
  {
    id: "11",
    studentId: "2",
    teacherId: "1",
    vehicleId: "2",
    date: "2025-03-03",
    startTime: "10:00",
    endTime: "12:00",
    status: "completed",
    createdAt: "2025-02-27T08:00:00Z",
    completedAt: "2025-03-03T12:00:00Z",
  },
  {
    id: "12",
    studentId: "1",
    teacherId: "1",
    vehicleId: "1",
    date: "2025-03-05",
    startTime: "13:00",
    endTime: "15:00",
    status: "completed",
    createdAt: "2025-03-01T09:00:00Z",
    completedAt: "2025-03-05T15:00:00Z",
  },
  {
    id: "13",
    studentId: "2",
    teacherId: "1",
    vehicleId: "2",
    date: "2025-03-08",
    startTime: "09:00",
    endTime: "11:00",
    status: "completed",
    createdAt: "2025-03-03T10:00:00Z",
    completedAt: "2025-03-08T11:00:00Z",
  },
  {
    id: "14",
    studentId: "1",
    teacherId: "1",
    vehicleId: "1",
    date: "2025-03-10",
    startTime: "14:00",
    endTime: "16:00",
    status: "completed",
    createdAt: "2025-03-05T08:00:00Z",
    completedAt: "2025-03-10T16:00:00Z",
  },
  {
    id: "15",
    studentId: "2",
    teacherId: "1",
    vehicleId: "2",
    date: "2025-03-12",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    createdAt: "2025-03-08T09:00:00Z",
    completedAt: "2025-03-12T10:00:00Z",
  },
  {
    id: "16",
    studentId: "1",
    teacherId: "1",
    vehicleId: "1",
    date: "2025-03-15",
    startTime: "10:00",
    endTime: "12:00",
    status: "completed",
    createdAt: "2025-03-10T10:00:00Z",
    completedAt: "2025-03-15T12:00:00Z",
  },
  {
    id: "17",
    studentId: "2",
    teacherId: "1",
    vehicleId: "2",
    date: "2025-03-18",
    startTime: "13:00",
    endTime: "15:00",
    status: "completed",
    createdAt: "2025-03-12T08:00:00Z",
    completedAt: "2025-03-18T15:00:00Z",
  },
  // Teacher 2 (Maria Garcia) - January 2025
  {
    id: "4",
    studentId: "2",
    teacherId: "2",
    date: "2025-01-25",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    createdAt: "2025-01-20T08:00:00Z",
    completedAt: "2025-01-25T10:00:00Z",
  },
  {
    id: "18",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2025-01-28",
    startTime: "10:00",
    endTime: "12:00",
    status: "completed",
    createdAt: "2025-01-23T09:00:00Z",
    completedAt: "2025-01-28T12:00:00Z",
  },
  {
    id: "19",
    studentId: "2",
    teacherId: "2",
    date: "2025-01-30",
    startTime: "13:00",
    endTime: "15:00",
    status: "completed",
    createdAt: "2025-01-25T08:00:00Z",
    completedAt: "2025-01-30T15:00:00Z",
  },
  // Teacher 2 (Maria Garcia) - February 2025
  {
    id: "20",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2025-02-05",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    createdAt: "2025-01-30T10:00:00Z",
    completedAt: "2025-02-05T10:00:00Z",
  },
  {
    id: "21",
    studentId: "2",
    teacherId: "2",
    date: "2025-02-08",
    startTime: "10:00",
    endTime: "12:00",
    status: "completed",
    createdAt: "2025-02-03T09:00:00Z",
    completedAt: "2025-02-08T12:00:00Z",
  },
  {
    id: "22",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2025-02-12",
    startTime: "13:00",
    endTime: "15:00",
    status: "completed",
    createdAt: "2025-02-07T08:00:00Z",
    completedAt: "2025-02-12T15:00:00Z",
  },
  {
    id: "23",
    studentId: "2",
    teacherId: "2",
    date: "2025-02-14",
    startTime: "09:00",
    endTime: "11:00",
    status: "completed",
    createdAt: "2025-02-09T10:00:00Z",
    completedAt: "2025-02-14T11:00:00Z",
  },
  {
    id: "24",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2025-02-19",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    createdAt: "2025-02-14T09:00:00Z",
    completedAt: "2025-02-19T10:00:00Z",
  },
  {
    id: "25",
    studentId: "2",
    teacherId: "2",
    date: "2025-02-21",
    startTime: "10:00",
    endTime: "12:00",
    status: "completed",
    createdAt: "2025-02-16T08:00:00Z",
    completedAt: "2025-02-21T12:00:00Z",
  },
  {
    id: "26",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2025-02-24",
    startTime: "13:00",
    endTime: "15:00",
    status: "completed",
    createdAt: "2025-02-19T09:00:00Z",
    completedAt: "2025-02-24T15:00:00Z",
  },
  {
    id: "27",
    studentId: "2",
    teacherId: "2",
    date: "2025-02-26",
    startTime: "09:00",
    endTime: "11:00",
    status: "completed",
    createdAt: "2025-02-21T10:00:00Z",
    completedAt: "2025-02-26T11:00:00Z",
  },
  {
    id: "28",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2025-02-28",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    createdAt: "2025-02-24T08:00:00Z",
    completedAt: "2025-02-28T10:00:00Z",
  },
  // Teacher 2 (Maria Garcia) - March 2025
  {
    id: "29",
    studentId: "2",
    teacherId: "2",
    date: "2025-03-02",
    startTime: "10:00",
    endTime: "12:00",
    status: "completed",
    createdAt: "2025-02-26T09:00:00Z",
    completedAt: "2025-03-02T12:00:00Z",
  },
  {
    id: "30",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2025-03-04",
    startTime: "13:00",
    endTime: "15:00",
    status: "completed",
    createdAt: "2025-02-28T10:00:00Z",
    completedAt: "2025-03-04T15:00:00Z",
  },
  {
    id: "31",
    studentId: "2",
    teacherId: "2",
    date: "2025-03-06",
    startTime: "09:00",
    endTime: "11:00",
    status: "completed",
    createdAt: "2025-03-02T08:00:00Z",
    completedAt: "2025-03-06T11:00:00Z",
  },
  {
    id: "32",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2025-03-09",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    createdAt: "2025-03-04T09:00:00Z",
    completedAt: "2025-03-09T10:00:00Z",
  },
  {
    id: "33",
    studentId: "2",
    teacherId: "2",
    date: "2025-03-11",
    startTime: "10:00",
    endTime: "12:00",
    status: "completed",
    createdAt: "2025-03-06T10:00:00Z",
    completedAt: "2025-03-11T12:00:00Z",
  },
  {
    id: "34",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2025-03-13",
    startTime: "13:00",
    endTime: "15:00",
    status: "completed",
    createdAt: "2025-03-09T08:00:00Z",
    completedAt: "2025-03-13T15:00:00Z",
  },
  {
    id: "35",
    studentId: "2",
    teacherId: "2",
    date: "2025-03-16",
    startTime: "09:00",
    endTime: "11:00",
    status: "completed",
    createdAt: "2025-03-11T09:00:00Z",
    completedAt: "2025-03-16T11:00:00Z",
  },
  {
    id: "36",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2025-03-19",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    createdAt: "2025-03-13T10:00:00Z",
    completedAt: "2025-03-19T10:00:00Z",
  },
  // Teacher 3 (Robert Johnson) - January 2025 (before being inactive)
  {
    id: "37",
    studentId: "1",
    teacherId: "3",
    vehicleId: "1",
    date: "2025-01-15",
    startTime: "10:00",
    endTime: "12:00",
    status: "completed",
    createdAt: "2025-01-10T08:00:00Z",
    completedAt: "2025-01-15T12:00:00Z",
  },
  {
    id: "38",
    studentId: "2",
    teacherId: "3",
    vehicleId: "2",
    date: "2025-01-18",
    startTime: "13:00",
    endTime: "15:00",
    status: "completed",
    createdAt: "2025-01-13T09:00:00Z",
    completedAt: "2025-01-18T15:00:00Z",
  },
  {
    id: "39",
    studentId: "1",
    teacherId: "3",
    vehicleId: "1",
    date: "2025-01-22",
    startTime: "09:00",
    endTime: "11:00",
    status: "completed",
    createdAt: "2025-01-17T10:00:00Z",
    completedAt: "2025-01-22T11:00:00Z",
  },
  {
    id: "40",
    studentId: "2",
    teacherId: "3",
    vehicleId: "2",
    date: "2025-01-26",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    createdAt: "2025-01-21T08:00:00Z",
    completedAt: "2025-01-26T10:00:00Z",
  },
  {
    id: "41",
    studentId: "1",
    teacherId: "3",
    vehicleId: "1",
    date: "2025-01-29",
    startTime: "10:00",
    endTime: "12:00",
    status: "completed",
    createdAt: "2025-01-24T09:00:00Z",
    completedAt: "2025-01-29T12:00:00Z",
  },
  // Teacher 3 (Robert Johnson) - February 2025 (before being inactive)
  {
    id: "42",
    studentId: "2",
    teacherId: "3",
    vehicleId: "2",
    date: "2025-02-02",
    startTime: "13:00",
    endTime: "15:00",
    status: "completed",
    createdAt: "2025-01-28T10:00:00Z",
    completedAt: "2025-02-02T15:00:00Z",
  },
  {
    id: "43",
    studentId: "1",
    teacherId: "3",
    vehicleId: "1",
    date: "2025-02-06",
    startTime: "09:00",
    endTime: "11:00",
    status: "completed",
    createdAt: "2025-02-01T08:00:00Z",
    completedAt: "2025-02-06T11:00:00Z",
  },
  {
    id: "44",
    studentId: "2",
    teacherId: "3",
    vehicleId: "2",
    date: "2025-02-10",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    createdAt: "2025-02-05T09:00:00Z",
    completedAt: "2025-02-10T10:00:00Z",
  },
  {
    id: "45",
    studentId: "1",
    teacherId: "3",
    vehicleId: "1",
    date: "2025-02-13",
    startTime: "10:00",
    endTime: "12:00",
    status: "completed",
    createdAt: "2025-02-08T10:00:00Z",
    completedAt: "2025-02-13T12:00:00Z",
  },
  {
    id: "46",
    studentId: "2",
    teacherId: "3",
    vehicleId: "2",
    date: "2025-02-17",
    startTime: "13:00",
    endTime: "15:00",
    status: "completed",
    createdAt: "2025-02-12T08:00:00Z",
    completedAt: "2025-02-17T15:00:00Z",
  },
  // Pending/Confirmed reservations (not completed)
  {
    id: "3",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2025-02-20",
    startTime: "10:00",
    endTime: "12:00",
    status: "confirmed",
    createdAt: "2025-02-12T11:00:00Z",
  },
  {
    id: "47",
    studentId: "2",
    teacherId: "1",
    vehicleId: "1",
    date: "2025-03-20",
    startTime: "09:00",
    endTime: "11:00",
    status: "pending",
    createdAt: "2025-03-15T10:00:00Z",
  },
  {
    id: "48",
    studentId: "1",
    teacherId: "2",
    vehicleId: "2",
    date: "2025-03-22",
    startTime: "14:00",
    endTime: "16:00",
    status: "confirmed",
    createdAt: "2025-03-17T09:00:00Z",
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
