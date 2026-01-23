/**
 * Authentication API Wrapper
 * Routes requests to either mock or real API based on configuration
 */

import { isMockMode } from "../../config/api.config";
import * as realApi from "../auth";
import { ApiResponse } from "../../utils/errorHandler";
import type { CurrentUser } from "../auth";

// Mock implementation
async function getCurrentUserMock(): Promise<ApiResponse<CurrentUser>> {
  // Return mock user from localStorage if available
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("driving-school-user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        return {
          success: true,
          data: {
            id: Number(user.id) || 1,
            name: user.name || "",
            last_name: user.name?.split(" ").slice(1).join(" ") || "",
            document: user.legalId || "",
            email: user.email || "",
            number_phone: "",
            role: user.role === "teacher" ? "docente" : user.role === "admin" ? "admin" : "user",
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      } catch {
        // Fall through to default mock
      }
    }
  }
  
  return {
    success: true,
    data: {
      id: 1,
      name: "Usuario",
      last_name: "Demo",
      document: "12345678",
      email: "demo@example.com",
      number_phone: "3001234567",
      role: "user",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

/**
 * GET /api/me
 */
export async function getCurrentUser(): Promise<ApiResponse<CurrentUser>> {
  return isMockMode() ? getCurrentUserMock() : realApi.getCurrentUser();
}
