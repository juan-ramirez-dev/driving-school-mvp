/**
 * System Settings API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as realApi from "../system-settings";
import { ApiResponse } from "../../utils/errorHandler";
import type {
  SystemSetting,
  CreateSystemSettingData,
  UpdateSystemSettingData,
} from "../system-settings";

// Mock implementation
async function getSystemSettingsMock(): Promise<ApiResponse<SystemSetting[]>> {
  return {
    success: true,
    data: [],
  };
}

async function getSystemSettingByKeyMock(
  key: string
): Promise<ApiResponse<SystemSetting>> {
  return {
    success: false,
    message: "System setting not found",
    code: 404,
  };
}

async function createSystemSettingMock(
  data: CreateSystemSettingData
): Promise<ApiResponse<SystemSetting>> {
  return {
    success: false,
    message: "Mock mode: Cannot create system settings",
    code: 400,
  };
}

async function updateSystemSettingMock(
  key: string,
  data: UpdateSystemSettingData
): Promise<ApiResponse<SystemSetting>> {
  return {
    success: false,
    message: "Mock mode: Cannot update system settings",
    code: 400,
  };
}

async function deleteSystemSettingMock(
  key: string
): Promise<ApiResponse<{ message: string }>> {
  return {
    success: false,
    message: "Mock mode: Cannot delete system settings",
    code: 400,
  };
}

/**
 * GET /api/system-settings
 */
export async function getSystemSettings(): Promise<ApiResponse<SystemSetting[]>> {
  return isMockMode() 
    ? getSystemSettingsMock() 
    : realApi.getSystemSettings();
}

/**
 * GET /api/system-settings/{key}
 */
export async function getSystemSettingByKey(
  key: string
): Promise<ApiResponse<SystemSetting>> {
  return isMockMode() 
    ? getSystemSettingByKeyMock(key) 
    : realApi.getSystemSettingByKey(key);
}

/**
 * POST /api/system-settings
 */
export async function createSystemSetting(
  data: CreateSystemSettingData
): Promise<ApiResponse<SystemSetting>> {
  return isMockMode() 
    ? createSystemSettingMock(data) 
    : realApi.createSystemSetting(data);
}

/**
 * PUT /api/system-settings/{key}
 */
export async function updateSystemSetting(
  key: string,
  data: UpdateSystemSettingData
): Promise<ApiResponse<SystemSetting>> {
  return isMockMode() 
    ? updateSystemSettingMock(key, data) 
    : realApi.updateSystemSetting(key, data);
}

/**
 * DELETE /api/system-settings/{key}
 */
export async function deleteSystemSetting(
  key: string
): Promise<ApiResponse<{ message: string }>> {
  return isMockMode() 
    ? deleteSystemSettingMock(key) 
    : realApi.deleteSystemSetting(key);
}
