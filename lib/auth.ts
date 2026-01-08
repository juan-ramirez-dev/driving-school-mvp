import type { User } from "./types";

const STORAGE_KEY = "driving-school-user";

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  {
    id: "1",
    username: "student1",
    email: "student1@example.com",
    name: "Alex Thompson",
  },
  {
    id: "2",
    username: "student2",
    email: "student2@example.com",
    name: "Maria Garcia",
  },
];

// Simple mock authentication - accepts any username/password
export function login(username: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Find user by username or create a new one
      let user = MOCK_USERS.find((u) => u.username === username);

      if (!user) {
        // Create a new user for demo purposes
        user = {
          id: `${MOCK_USERS.length + 1}`,
          username,
          email: `${username}@example.com`,
          name: username.charAt(0).toUpperCase() + username.slice(1),
        };
        MOCK_USERS.push(user);
      }

      // Simple validation - just check that username and password are provided
      if (!username || !password) {
        reject(new Error("Se requiere usuario y contraseña"));
        return;
      }

      // Save user to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }

      resolve(user);
    }, 500); // Simulate API delay
  });
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

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

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
