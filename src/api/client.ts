/**
 * Real API Client
 * Handles actual HTTP requests to the backend
 */

import {
  ApiResponse,
  HttpErrorCode,
  createSuccessResponse,
  handleError,
} from "../utils/errorHandler";
import { getApiBaseUrl } from "../config/api.config";

const TOKEN_STORAGE_KEY = "driving-school-token";

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Save authentication token to localStorage
 * This is called automatically when login/register endpoints return a token
 */
export function saveAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

/**
 * Clear authentication token from localStorage
 */
export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

/**
 * Get standard API headers with Content-Type, Accept, and Authorization
 * This utility function can be used for all API endpoints
 * @param includeAuth - Whether to include Authorization header (default: true)
 * @returns HeadersInit object with standard headers
 */
export function getApiHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  if (includeAuth) {
    // Add Bearer token from auth if available
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      // Fallback to API key if no token (for development/testing)
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
    }
  }

  return headers;
}

/**
 * Default fetch options with common headers
 * @deprecated Use getApiHeaders() instead for consistency
 */
function getDefaultHeaders(): HeadersInit {
  return getApiHeaders();
}

/**
 * Check if response contains auth token and save it automatically
 * This handles login and register endpoints that return tokens
 */
function handleAuthTokenResponse(data: any): void {
  // Check if response has token (from login/register endpoints)
  if (data && typeof data === "object" && "token" in data && data.token) {
    saveAuthToken(data.token);
  }
}

/**
 * Make an HTTP request to the real API
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...getDefaultHeaders(),
        ...options.headers,
      },
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Pass the entire error object to handleError so it can extract validation errors
      return handleError(
        errorData, // Pass the full error object, not just the message
        `HTTP ${response.status}: ${response.statusText}`,
        response.status as HttpErrorCode
      );
    }

    const data = await response.json();
    
    // Backend returns nested structure: { status, message, data: [...], pagination: {...} }
    // Extract the actual data from data.data if it exists and data is an object with status/message
    // This handles Laravel ResponseHelper::paginated format
    let extractedData = data;
    
    if (
      data &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      "data" in data &&
      data.data !== undefined &&
      ("status" in data || "message" in data || "pagination" in data)
    ) {
      // This is a wrapped response with status/message/pagination, extract the inner data
      extractedData = data.data;
    }
    
    return createSuccessResponse(extractedData);
  } catch (error) {
    return handleError(error, "Failed to connect to API");
  }
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: "GET" });
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body: unknown,
  options?: { saveToken?: boolean }
): Promise<ApiResponse<T>> {
  const response = await apiRequest<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });

  // Automatically save token if this is a login/register endpoint
  if (options?.saveToken !== false && (endpoint === "/login" || endpoint === "/register")) {
    if (response.success && response.data) {
      handleAuthTokenResponse(response.data);
    }
  }

  return response;
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T>(
  endpoint: string
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: "DELETE" });
}
