/**
 * System Settings Utility
 * Provides cached access to system settings with default values
 */

import { getSystemSettings as fetchSystemSettingsFromAPI } from "@/src/api";
import type { SystemSetting } from "@/src/api/system-settings";

// Cache for system settings
let settingsCache: SystemSetting[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Default values for system settings
const DEFAULT_SETTINGS: Record<string, any> = {
  cancellation_hours_limit: 4,
  cancellation_allow_after_limit: true,
  cancellation_late_penalty_enabled: true,
  cancellation_late_penalty_amount: 50000,
  attendance_tolerance_minutes: 10,
  attendance_count_absent_as_no_show: true,
  attendance_no_show_penalty_enabled: true,
  attendance_no_show_penalty_amount: 50000,
  attendance_no_show_limit: 3,
};

/**
 * Convert setting value to appropriate type
 */
function convertSettingValue(setting: SystemSetting): any {
  if (!setting) return null;
  
  switch (setting.type) {
    case "int":
      return typeof setting.value === "number" 
        ? setting.value 
        : parseInt(String(setting.value), 10);
    case "bool":
      if (typeof setting.value === "boolean") return setting.value;
      const strValue = String(setting.value).toLowerCase();
      return strValue === "true" || strValue === "1";
    case "json":
      try {
        return typeof setting.value === "string" 
          ? JSON.parse(setting.value) 
          : setting.value;
      } catch {
        return setting.value;
      }
    default:
      return setting.value;
  }
}

/**
 * Fetch all system settings and cache them
 */
async function fetchSystemSettingsInternal(): Promise<SystemSetting[]> {
  try {
    const response = await fetchSystemSettingsFromAPI();
    if (response.success && response.data) {
      settingsCache = response.data;
      cacheTimestamp = Date.now();
      return response.data;
    }
    // If fetch fails, return empty array (will use defaults)
    return [];
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return [];
  }
}

/**
 * Get all system settings (with caching)
 */
export async function getCachedSystemSettings(): Promise<SystemSetting[]> {
  const now = Date.now();
  
  // Check if cache is valid
  if (settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return settingsCache;
  }
  
  // Fetch and cache
  return await fetchSystemSettingsInternal();
}

/**
 * Get a specific setting by key with fallback to default
 */
export async function getSetting(
  key: string,
  defaultValue?: any
): Promise<any> {
  const settings = await getCachedSystemSettings();
  const setting = settings.find((s) => s.setting_key === key);
  
  if (setting) {
    return convertSettingValue(setting);
  }
  
  // Return provided default or use predefined default
  return defaultValue !== undefined ? defaultValue : DEFAULT_SETTINGS[key];
}

/**
 * Clear the settings cache
 */
export function clearSettingsCache(): void {
  settingsCache = null;
  cacheTimestamp = 0;
}

/**
 * Get all cancellation-related settings
 */
export async function getCancellationSettings(): Promise<{
  hoursLimit: number;
  allowAfterLimit: boolean;
  latePenaltyEnabled: boolean;
  latePenaltyAmount: number;
}> {
  const [hoursLimit, allowAfterLimit, latePenaltyEnabled, latePenaltyAmount] = 
    await Promise.all([
      getSetting("cancellation_hours_limit"),
      getSetting("cancellation_allow_after_limit"),
      getSetting("cancellation_late_penalty_enabled"),
      getSetting("cancellation_late_penalty_amount"),
    ]);

  return {
    hoursLimit: hoursLimit as number,
    allowAfterLimit: allowAfterLimit as boolean,
    latePenaltyEnabled: latePenaltyEnabled as boolean,
    latePenaltyAmount: latePenaltyAmount as number,
  };
}

/**
 * Get all attendance-related settings
 */
export async function getAttendanceSettings(): Promise<{
  toleranceMinutes: number;
  countAbsentAsNoShow: boolean;
  noShowPenaltyEnabled: boolean;
  noShowPenaltyAmount: number;
  noShowLimit: number;
}> {
  const [
    toleranceMinutes,
    countAbsentAsNoShow,
    noShowPenaltyEnabled,
    noShowPenaltyAmount,
    noShowLimit,
  ] = await Promise.all([
    getSetting("attendance_tolerance_minutes"),
    getSetting("attendance_count_absent_as_no_show"),
    getSetting("attendance_no_show_penalty_enabled"),
    getSetting("attendance_no_show_penalty_amount"),
    getSetting("attendance_no_show_limit"),
  ]);

  return {
    toleranceMinutes: toleranceMinutes as number,
    countAbsentAsNoShow: countAbsentAsNoShow as boolean,
    noShowPenaltyEnabled: noShowPenaltyEnabled as boolean,
    noShowPenaltyAmount: noShowPenaltyAmount as number,
    noShowLimit: noShowLimit as number,
  };
}
