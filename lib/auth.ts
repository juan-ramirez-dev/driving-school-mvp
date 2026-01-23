import type { User } from "./types";
import { getApiBaseUrl } from "@/src/config/api.config";
import { saveAuthToken, clearAuthToken, getApiHeaders } from "@/src/api/client";

const STORAGE_KEY = "driving-school-user";
const TOKEN_STORAGE_KEY = "driving-school-token";

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  {
    id: "1",
    username: "student1",
    email: "student1@example.com",
    name: "Alex Thompson",
    legalId: "12345678A",
    role: "student",
  },
  {
    id: "2",
    username: "student2",
    email: "student2@example.com",
    name: "Maria Garcia",
    legalId: "87654321B",
    role: "student",
  },
];

/**
 * Map backend role to frontend role
 */
function mapBackendRoleToFrontend(backendRole: string): "student" | "admin" | "teacher" {
  if (backendRole === "docente") {
    return "teacher";
  }
  if (backendRole === "admin" || backendRole === "administrator") {
    return "admin";
  }
  return "student"; // Default to student for "user" or any other role
}

/**
 * Login using backend API
 * Maps identification field to document for backend
 * Token is automatically saved by the API client
 */
export async function login(document: string, password: string): Promise<User> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: getApiHeaders(false), // Don't include auth token for login
      body: JSON.stringify({
        document: document,
        password: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.errors?.document?.[0] || "Credenciales incorrectas";
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const backendUser = data.user;
    const token = data.token;

    // Save token using centralized function from API client
    if (token) {
      saveAuthToken(token);
    }

    // Map backend user to frontend User format
    const frontendUser: User = {
      id: String(backendUser.id),
      username: backendUser.document || backendUser.email || document,
      email: backendUser.email || `${backendUser.document}@example.com`,
      name: backendUser.name || backendUser.last_name ? `${backendUser.name} ${backendUser.last_name}`.trim() : document,
      legalId: backendUser.document,
      role: mapBackendRoleToFrontend(backendUser.role),
    };

    // Store user in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(frontendUser));
    }

    return frontendUser;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    const errorMessage = error instanceof Error ? error.message : "Error al iniciar sesión";
    throw new Error(errorMessage);
  }
}

/**
 * Register new user using backend API
 * Token is automatically saved by the API client
 */
export interface RegisterData {
  name: string;
  document: string;
  password: string;
  password_confirmation: string;
}

export async function register(data: RegisterData): Promise<User> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: getApiHeaders(false), // Don't include auth token for register
      body: JSON.stringify({
        name: data.name,
        document: data.document,
        password: data.password,
        password_confirmation: data.password_confirmation,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.errors?.document?.[0] || errorData.errors?.password?.[0] || "Error al registrar usuario";
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    const backendUser = responseData.user;
    const token = responseData.token;

    // Save token using centralized function from API client
    if (token) {
      saveAuthToken(token);
    }

    // Map backend user to frontend User format
    const frontendUser: User = {
      id: String(backendUser.id),
      username: backendUser.document || backendUser.email || data.document,
      email: backendUser.email || `${backendUser.document}@example.com`,
      name: backendUser.name || data.name,
      legalId: backendUser.document || data.document,
      role: mapBackendRoleToFrontend(backendUser.role),
    };

    // Store user in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(frontendUser));
    }

    return frontendUser;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error al registrar usuario";
    throw new Error(errorMessage);
  }
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === "admin";
}

export function isTeacher(): boolean {
  const user = getCurrentUser();
  return user?.role === "teacher";
}

export function isStudent(): boolean {
  const user = getCurrentUser();
  return user?.role === "student";
}

export function getUserRole(): "student" | "admin" | "teacher" | null {
  const user = getCurrentUser();
  if (!user) return null;
  if (user.role) return user.role;
  if (user.username === "admin") return "admin";
  if (user.username === "teacher") return "teacher";
  return "student";
}

/**
 * Logout and clear session from backend
 */
export async function logout(): Promise<void> {
  const token = getAuthToken();
  
  // Call backend logout if token exists
  if (token && typeof window !== "undefined") {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/logout`, {
        method: "POST",
        headers: getApiHeaders(true), // Include auth token for logout
      });
    } catch (error) {
      // Continue with local logout even if backend call fails
      console.error("Error calling logout endpoint:", error);
    }
  }

  // Clear local storage using centralized function
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    clearAuthToken();
  }
}

/**
 * Get current user from localStorage (synchronous)
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Fetch current user from API and update localStorage
 * This calls GET /api/me to get the latest user data
 */
export async function fetchCurrentUserFromAPI(): Promise<User | null> {
  try {
    const { getCurrentUser: getCurrentUserAPI } = await import("@/src/api");
    const response = await getCurrentUserAPI();
    
    if (response.success && response.data) {
      const backendUser = response.data;
      
      // Map backend user to frontend User format
      const frontendUser: User = {
        id: String(backendUser.id),
        username: backendUser.document || backendUser.email || "",
        email: backendUser.email || "",
        name: backendUser.last_name 
          ? `${backendUser.name} ${backendUser.last_name}`.trim() 
          : backendUser.name,
        legalId: backendUser.document,
        role: mapBackendRoleToFrontend(backendUser.role),
      };
      
      // Update localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(frontendUser));
      }
      
      return frontendUser;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching current user from API:", error);
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
