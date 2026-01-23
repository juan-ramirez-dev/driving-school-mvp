/**
 * Real API Client for Authentication
 * Makes actual HTTP requests to backend authentication endpoints
 */

import { apiGet } from "./client";
import { ApiResponse } from "../utils/errorHandler";

export interface CurrentUser {
  id: number;
  name: string;
  last_name: string;
  document: string;
  email: string;
  number_phone: string;
  role: "user" | "docente" | "admin";
  active: boolean;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/me
 * Returns current authenticated user
 */
export async function getCurrentUser(): Promise<ApiResponse<CurrentUser>> {
  return apiGet<CurrentUser>("/me");
}
