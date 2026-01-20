/**
 * Dashboard API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as mockApi from "../../mocks/dashboard";
import * as realApi from "../dashboard";
import { ApiResponse } from "../../utils/errorHandler";
import { Reservation, RUNTExportData } from "../../mocks/types";

/**
 * GET /dashboard/active-students
 */
export async function getActiveStudentsCount(): Promise<
  ApiResponse<{ count: number }>
> {
  return isMockMode()
    ? mockApi.getActiveStudentsCount()
    : realApi.getActiveStudentsCount();
}

/**
 * GET /dashboard/last-month-reservations
 */
export async function getLastMonthReservations(): Promise<
  ApiResponse<{ count: number; reservations: Reservation[] }>
> {
  return isMockMode()
    ? mockApi.getLastMonthReservations()
    : realApi.getLastMonthReservations();
}

/**
 * GET /dashboard/completed-reservations?teacher=:id
 */
export async function getCompletedReservations(
  teacherId?: string
): Promise<ApiResponse<{ count: number; reservations: Reservation[] }>> {
  return isMockMode()
    ? mockApi.getCompletedReservations(teacherId)
    : realApi.getCompletedReservations(teacherId);
}

/**
 * GET /dashboard/export-runt
 */
export async function exportRUNT(): Promise<ApiResponse<RUNTExportData>> {
  return isMockMode() ? mockApi.exportRUNT() : realApi.exportRUNT();
}
