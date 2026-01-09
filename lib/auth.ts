import type { User } from "./types";

const STORAGE_KEY = "driving-school-user";

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

// Simple mock authentication - accepts any username/password
export function login(username: string, password: string, identification?: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check for admin login
      if (username === "admin" && password === "admin") {
        const adminUser: User = {
          id: "admin-1",
          username: "admin",
          email: "admin@drivingschool.com",
          name: "Administrador",
          role: "admin",
        };

        // Save admin user to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
        }

        resolve(adminUser);
        return;
      }

      // Find user by username or create a new one
      let user = MOCK_USERS.find((u) => u.username === username);

      if (!user) {
        // Create a new user for demo purposes
        user = {
          id: `${MOCK_USERS.length + 1}`,
          username,
          email: `${username}@example.com`,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          legalId: identification || `${Math.floor(Math.random() * 90000000) + 10000000}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          role: "student",
        };
        MOCK_USERS.push(user);
      } else if (identification) {
        // Update existing user's identification if provided
        user.legalId = identification;
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

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === "admin" || user?.username === "admin";
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
