/**
 * Real API Client for System Settings
 * Makes actual HTTP requests to backend system settings endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import { ApiResponse } from "../utils/errorHandler";

export interface SystemSetting {
  id: number;
  setting_key: string;
  name: string | null;
  description: string | null;
  type: "string" | "int" | "bool" | "json";
  value: string | number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSystemSettingData {
  setting_key: string;
  type: "string" | "int" | "bool" | "json";
  value: string | number | boolean;
  name?: string | null;
  description?: string | null;
}

export interface UpdateSystemSettingData {
  type: "string" | "int" | "bool" | "json";
  value: string | number | boolean;
  name?: string | null;
  description?: string | null;
}

/**
 * GET /api/system-settings
 * List all system settings
 */
export async function getSystemSettings(): Promise<ApiResponse<SystemSetting[]>> {
  return apiGet<SystemSetting[]>("/system-settings");
}

/**
 * GET /api/system-settings/{key}
 * Get system setting by key
 */
export async function getSystemSettingByKey(
  key: string
): Promise<ApiResponse<SystemSetting>> {
  return apiGet<SystemSetting>(`/system-settings/${key}`);
}

/**
 * POST /api/system-settings
 * Create a new system setting
 */
export async function createSystemSetting(
  data: CreateSystemSettingData
): Promise<ApiResponse<SystemSetting>> {
  return apiPost<SystemSetting>("/system-settings", data);
}

/**
 * PUT /api/system-settings/{key}
 * Update a system setting
 */
export async function updateSystemSetting(
  key: string,
  data: UpdateSystemSettingData
): Promise<ApiResponse<SystemSetting>> {
  return apiPut<SystemSetting>(`/system-settings/${key}`, data);
}

/**
 * DELETE /api/system-settings/{key}
 * Delete a system setting
 */
export async function deleteSystemSetting(
  key: string
): Promise<ApiResponse<{ message: string }>> {
  return apiDelete<{ message: string }>(`/system-settings/${key}`);
}
