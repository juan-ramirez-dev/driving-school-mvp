/**
 * Real API Client for Dashboard Statistics
 * Makes actual HTTP requests to backend endpoints
 */

import { apiGet } from "./client";
import { ApiResponse } from "../utils/errorHandler";
import { Reservation, RUNTExportData } from "../mocks/types";

/**
 * GET /dashboard/active-students
 * Returns count of active students
 */
export async function getActiveStudentsCount(): Promise<
  ApiResponse<{ count: number }>
> {
  return apiGet<{ count: number }>("/dashboard/active-students");
}

/**
 * GET /dashboard/last-month-reservations
 * Returns last month's reservations
 */
export async function getLastMonthReservations(): Promise<
  ApiResponse<{ count: number; reservations: Reservation[] }>
> {
  return apiGet<{ count: number; reservations: Reservation[] }>(
    "/dashboard/last-month-reservations"
  );
}

/**
 * GET /dashboard/completed-reservations?teacher=:id
 * Returns completed reservations, optionally filtered by teacher
 */
export async function getCompletedReservations(
  teacherId?: string
): Promise<ApiResponse<{ count: number; reservations: Reservation[] }>> {
  const endpoint = teacherId
    ? `/dashboard/completed-reservations?teacher=${teacherId}`
    : "/dashboard/completed-reservations";
  return apiGet<{ count: number; reservations: Reservation[] }>(endpoint);
}

/**
 * GET /dashboard/export-runt
 * Returns exportable RUNT format data
 */
export async function exportRUNT(): Promise<ApiResponse<RUNTExportData>> {
  return apiGet<RUNTExportData>("/dashboard/export-runt");
}
