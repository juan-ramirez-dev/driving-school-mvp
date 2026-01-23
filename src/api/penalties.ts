/**
 * Real API Client for Penalties
 * Makes actual HTTP requests to backend penalty endpoints
 */

import { apiGet, apiPost } from "./client";
import { ApiResponse } from "../utils/errorHandler";

export interface Penalty {
  id: number;
  user_id: number;
  appointment_id?: number | null;
  amount: number;
  reason: string;
  paid: boolean;
  paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    document: string;
  };
  appointment?: {
    id: number;
    date: string;
    status: string;
  };
}

export interface CreatePenaltyData {
  user_id: number;
  appointment_id?: number;
  amount: number;
  reason: string;
}

export interface UserDebt {
  user_id: number;
  total_debt: number;
}

/**
 * GET /api/penalties
 * List penalties (admin view, supports user_id filter)
 */
export async function getPenalties(
  userId?: number
): Promise<ApiResponse<Penalty[]>> {
  const endpoint = userId 
    ? `/penalties?user_id=${userId}` 
    : "/penalties";
  return apiGet<Penalty[]>(endpoint);
}

/**
 * POST /api/penalties
 * Create a new penalty
 */
export async function createPenalty(
  data: CreatePenaltyData
): Promise<ApiResponse<Penalty>> {
  return apiPost<Penalty>("/penalties", data);
}

/**
 * POST /api/penalties/{id}/pay
 * Mark penalty as paid
 */
export async function markPenaltyAsPaid(
  id: string | number
): Promise<ApiResponse<Penalty>> {
  return apiPost<Penalty>(`/penalties/${id}/pay`, {});
}

/**
 * GET /api/penalties/user/{userId}/debt
 * Get total debt for a user
 */
export async function getUserDebt(
  userId: number
): Promise<ApiResponse<UserDebt>> {
  return apiGet<UserDebt>(`/penalties/user/${userId}/debt`);
}
