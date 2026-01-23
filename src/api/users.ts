/**
 * Real API Client for Users
 * Makes actual HTTP requests to backend user endpoints
 */

import { apiPost } from "./client";
import { ApiResponse } from "../utils/errorHandler";

export interface User {
  id: number;
  name: string;
  document: string;
  role: "user" | "docente";
}

export interface CreateOrUpdateUserData {
  name: string;
  last_name: string;
  document: string;
  email: string;
  number_phone?: string;
  role: "user" | "docente";
}

/**
 * POST /api/users
 * Create or update a user
 * If user exists by email, updates; otherwise creates
 * Generates password and sends credentials via email
 */
export async function createOrUpdateUser(
  data: CreateOrUpdateUserData
): Promise<ApiResponse<User>> {
  return apiPost<User>("/users", data);
}
