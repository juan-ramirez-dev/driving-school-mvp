/**
 * Real API Client for Dashboard Statistics
 * Makes actual HTTP requests to backend endpoints
 */

import { apiGet } from "./client";
import { ApiResponse } from "../utils/errorHandler";
import { Reservation, RUNTExportData } from "../mocks/types";
import { getApiBaseUrl } from "../config/api.config";
import {
  transformDashboardActiveStudents,
  transformDashboardReservations,
} from "../utils/responseTransformers";

/**
 * GET /dashboard/active-students
 * Returns count of active students
 */
export async function getActiveStudentsCount(): Promise<
  ApiResponse<{ count: number }>
> {
  const response = await apiGet<{
    total?: number;
    active?: number;
    inactive?: number;
  }>("/dashboard/active-students");
  
  if (response.success && response.data) {
    return {
      ...response,
      data: transformDashboardActiveStudents(response.data),
    };
  }
  
  return response as ApiResponse<{ count: number }>;
}

/**
 * GET /dashboard/last-month-reservations
 * Returns last month's reservations
 */
export async function getLastMonthReservations(): Promise<
  ApiResponse<{ count: number; reservations: Reservation[] }>
> {
  const response = await apiGet<any>("/dashboard/last-month-reservations");
  
  if (response.success && response.data) {
    // Backend returns counts, but we need to fetch actual reservations
    // For now, transform the response structure
    const transformed = transformDashboardReservations(
      response.data,
      response.data.reservations || []
    );
    return {
      ...response,
      data: transformed,
    };
  }
  
  return response as ApiResponse<{ count: number; reservations: Reservation[] }>;
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
  
  const response = await apiGet<any>(endpoint);
  
  if (response.success && response.data) {
    const transformed = transformDashboardReservations(
      response.data,
      response.data.reservations || []
    );
    return {
      ...response,
      data: transformed,
    };
  }
  
  return response as ApiResponse<{ count: number; reservations: Reservation[] }>;
}

/**
 * GET /dashboard/export-runt
 * Returns exportable RUNT format data as CSV file download
 */
export async function exportRUNT(): Promise<ApiResponse<Blob>> {
  try {
    const baseUrl = getApiBaseUrl();
    const token = typeof window !== "undefined" ? localStorage.getItem("driving-school-token") : null;
    
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseUrl}/dashboard/export-runt`, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Trigger download
    if (typeof window !== "undefined") {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `runt-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
    
    return {
      success: true,
      data: blob,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error al exportar RUNT",
      code: 500,
    };
  }
}
