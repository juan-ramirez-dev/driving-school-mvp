/**
 * Centralized error handling utility for mock API
 * Catches and logs simulated errors, sends standardized error objects
 */

import { notifyError } from "./notifier";

export interface ApiError {
  success: false;
  message: string;
  code?: number;
  details?: unknown;
  errors?: Record<string, string[]>; // Laravel validation errors
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * HTTP error codes for simulation
 */
export enum HttpErrorCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Format Laravel validation errors into a user-friendly message
 * @param errors - Laravel validation errors object
 * @returns Formatted error message string
 */
export function formatValidationErrors(
  errors: Record<string, string[]>
): string {
  const errorMessages: string[] = [];
  
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      // Format field name: "last_name" -> "Last Name"
      const formattedField = field
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      
      // Add all error messages for this field
      messages.forEach((msg) => {
        errorMessages.push(`${formattedField}: ${msg}`);
      });
    }
  }
  
  return errorMessages.length > 0 
    ? errorMessages.join("\n") 
    : "Validation error";
}

/**
 * Handles errors and returns a standardized error response
 * @param error - The error to handle
 * @param defaultMessage - Default error message if error is not a string or object with message
 * @param code - Optional HTTP error code
 * @returns Standardized error object
 */
export function handleError(
  error: unknown,
  defaultMessage: string = "An unexpected error occurred while fetching mock data.",
  code?: HttpErrorCode
): ApiError {
  console.error("API Error:", error);

  let message = defaultMessage;
  let errorCode = code;
  let validationErrors: Record<string, string[]> | undefined;

  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error) {
    message = error.message || defaultMessage;
  } else if (
    typeof error === "object" &&
    error !== null
  ) {
    // Handle Laravel validation error format and backend business-rule errors (422)
    if ("errors" in error && typeof error.errors === "object" && error.errors !== null) {
      validationErrors = error.errors as Record<string, string[]>;
      const formattedErrors = formatValidationErrors(validationErrors);
      // When errors is empty (e.g. 422 with status/message only), prefer backend message
      // so business-rule messages (resource blocked, access period, hours limit, etc.) are shown
      if (
        formattedErrors === "Validation error" &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
      ) {
        message = String((error as { message: string }).message);
      } else {
        message =
          "message" in error && typeof (error as { message?: string }).message === "string"
            ? formattedErrors || String((error as { message: string }).message)
            : formattedErrors;
      }
    } else if ("message" in error) {
      message = String(error.message);
    }
  }

  // Trigger notification
  notifyError(message);

  return {
    success: false,
    message,
    code: errorCode,
    details: error,
    errors: validationErrors,
  };
}

/**
 * Creates a success response wrapper
 * @param data - The data to wrap
 * @returns Standardized success response
 */
export function createSuccessResponse<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Simulates network delay
 * @param ms - Milliseconds to delay (default: 200-500ms random)
 * @returns Promise that resolves after delay
 */
export function simulateDelay(ms?: number): Promise<void> {
  const delay = ms ?? Math.floor(Math.random() * 300) + 200; // 200-500ms default
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Randomly simulates HTTP errors for testing
 * @param errorRate - Probability of error (0-1, default: 0.1 = 10%)
 * @returns Error code or null if no error
 */
export function simulateRandomError(
  errorRate: number = 0.1
): HttpErrorCode | null {
  if (Math.random() < errorRate) {
    const codes = [
      HttpErrorCode.BAD_REQUEST,
      HttpErrorCode.UNAUTHORIZED,
      HttpErrorCode.NOT_FOUND,
      HttpErrorCode.INTERNAL_SERVER_ERROR,
    ];
    return codes[Math.floor(Math.random() * codes.length)];
  }
  return null;
}
