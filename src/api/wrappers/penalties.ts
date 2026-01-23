/**
 * Penalties API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as realApi from "../penalties";
import { ApiResponse } from "../../utils/errorHandler";
import type { Penalty, CreatePenaltyData, UserDebt } from "../penalties";

// Mock implementation
async function getPenaltiesMock(
  userId?: number
): Promise<ApiResponse<Penalty[]>> {
  return {
    success: true,
    data: [],
  };
}

async function createPenaltyMock(
  data: CreatePenaltyData
): Promise<ApiResponse<Penalty>> {
  return {
    success: false,
    message: "Mock mode: Cannot create penalties",
    code: 400,
  };
}

async function markPenaltyAsPaidMock(
  id: string | number
): Promise<ApiResponse<Penalty>> {
  return {
    success: false,
    message: "Mock mode: Cannot mark penalty as paid",
    code: 400,
  };
}

async function getUserDebtMock(
  userId: number
): Promise<ApiResponse<UserDebt>> {
  return {
    success: true,
    data: {
      user_id: userId,
      total_debt: 0,
    },
  };
}

/**
 * GET /api/penalties
 */
export async function getPenalties(
  userId?: number
): Promise<ApiResponse<Penalty[]>> {
  return isMockMode() 
    ? getPenaltiesMock(userId) 
    : realApi.getPenalties(userId);
}

/**
 * POST /api/penalties
 */
export async function createPenalty(
  data: CreatePenaltyData
): Promise<ApiResponse<Penalty>> {
  return isMockMode() 
    ? createPenaltyMock(data) 
    : realApi.createPenalty(data);
}

/**
 * POST /api/penalties/{id}/pay
 */
export async function markPenaltyAsPaid(
  id: string | number
): Promise<ApiResponse<Penalty>> {
  return isMockMode() 
    ? markPenaltyAsPaidMock(id) 
    : realApi.markPenaltyAsPaid(id);
}

/**
 * GET /api/penalties/user/{userId}/debt
 */
export async function getUserDebt(
  userId: number
): Promise<ApiResponse<UserDebt>> {
  return isMockMode() 
    ? getUserDebtMock(userId) 
    : realApi.getUserDebt(userId);
}
