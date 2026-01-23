/**
 * Users API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as realApi from "../users";
import { ApiResponse } from "../../utils/errorHandler";
import type { User, CreateOrUpdateUserData } from "../users";

// Mock implementation
async function createOrUpdateUserMock(
  data: CreateOrUpdateUserData
): Promise<ApiResponse<User>> {
  return {
    success: false,
    message: "Mock mode: Cannot create or update users",
    code: 400,
  };
}

/**
 * POST /api/users
 */
export async function createOrUpdateUser(
  data: CreateOrUpdateUserData
): Promise<ApiResponse<User>> {
  return isMockMode() 
    ? createOrUpdateUserMock(data) 
    : realApi.createOrUpdateUser(data);
}
