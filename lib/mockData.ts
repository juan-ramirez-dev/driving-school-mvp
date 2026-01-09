import type { Instructor, Booking, TimeSlot, ClassType, User } from "./types";

// Mock instructors
export const MOCK_INSTRUCTORS: Instructor[] = [
  { id: "1", name: "John Martinez", email: "john.martinez@drivingschool.com" },
  { id: "2", name: "Sarah Johnson", email: "sarah.johnson@drivingschool.com" },
  { id: "3", name: "Michael Chen", email: "michael.chen@drivingschool.com" },
  { id: "4", name: "Emily Rodriguez", email: "emily.rodriguez@drivingschool.com" },
];

// Generate time slots for a day (8:00 AM - 6:00 PM, 2-hour intervals)
export function generateTimeSlots(date: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = 8;
  const endHour = 18;
  const slotDuration = 2;

  for (let hour = startHour; hour < endHour; hour += slotDuration) {
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endHourValue = hour + slotDuration;
    const endTime = `${endHourValue.toString().padStart(2, "0")}:00`;
    
    slots.push({
      id: `${date}-${startTime}`,
      startTime,
      endTime,
      date,
      status: "available",
    });
  }

  return slots;
}

// Check if a time slot is available for a specific instructor
export function isSlotAvailable(
  date: string,
  startTime: string,
  instructorId: string,
  bookings: Booking[]
): boolean {
  // Check if instructor is already booked at this time
  const conflictingBooking = bookings.find(
    (booking) =>
      booking.instructorId === instructorId &&
      booking.date === date &&
      booking.startTime === startTime &&
      booking.status === "confirmed"
  );

  return !conflictingBooking;
}

// Generate availability for an instructor on a specific date
// This simulates realistic availability patterns
export function generateInstructorAvailability(
  instructorId: string,
  date: string,
  bookings: Booking[]
): TimeSlot[] {
  const allSlots = generateTimeSlots(date);
  
  return allSlots.map((slot) => {
    const available = isSlotAvailable(
      slot.date,
      slot.startTime,
      instructorId,
      bookings
    );

    // Simulate some random unavailability for demo purposes
    // In a real system, this would come from instructor schedules
    const randomUnavailable = Math.random() < 0.2; // 20% chance of random unavailability

    return {
      ...slot,
      instructorId,
      status: available && !randomUnavailable ? "available" : "unavailable",
    };
  });
}

// Create a booking
export function createBooking(
  userId: string,
  instructorId: string,
  classType: ClassType,
  date: string,
  startTime: string,
  endTime: string
): Booking {
  return {
    id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    instructorId,
    classType,
    date,
    startTime,
    endTime,
    createdAt: new Date().toISOString(),
    status: "confirmed",
  };
}

// Simulate API delay
export function simulateApiDelay(ms: number = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Initialize sample bookings for demo purposes
function initializeSampleBookings(): Booking[] {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split("T")[0];
  
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  const threeDaysLaterStr = threeDaysLater.toISOString().split("T")[0];
  
  const fourDaysLater = new Date();
  fourDaysLater.setDate(fourDaysLater.getDate() + 4);
  const fourDaysLaterStr = fourDaysLater.toISOString().split("T")[0];
  
  const fiveDaysLater = new Date();
  fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
  const fiveDaysLaterStr = fiveDaysLater.toISOString().split("T")[0];
  
  const oneWeekLater = new Date();
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  const oneWeekLaterStr = oneWeekLater.toISOString().split("T")[0];
  
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
  const twoWeeksLaterStr = twoWeeksLater.toISOString().split("T")[0];
  
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekStr = lastWeek.toISOString().split("T")[0];
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  
  const sampleBookings: Booking[] = [
    {
      id: "sample-1",
      userId: "1",
      instructorId: "1",
      classType: "theoretical",
      date: tomorrowStr,
      startTime: "08:00",
      endTime: "10:00",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-2",
      userId: "2",
      instructorId: "2",
      classType: "practical",
      date: tomorrowStr,
      startTime: "10:00",
      endTime: "12:00",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-3",
      userId: "1",
      instructorId: "3",
      classType: "practical",
      date: dayAfterStr,
      startTime: "14:00",
      endTime: "16:00",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-4",
      userId: "2",
      instructorId: "4",
      classType: "theoretical",
      date: dayAfterStr,
      startTime: "16:00",
      endTime: "18:00",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-5",
      userId: "1",
      instructorId: "1",
      classType: "practical",
      date: tomorrowStr,
      startTime: "14:00",
      endTime: "16:00",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-6",
      userId: "2",
      instructorId: "2",
      classType: "theoretical",
      date: threeDaysLaterStr,
      startTime: "08:00",
      endTime: "10:00",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-7",
      userId: "1",
      instructorId: "3",
      classType: "practical",
      date: threeDaysLaterStr,
      startTime: "10:00",
      endTime: "12:00",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-8",
      userId: "2",
      instructorId: "4",
      classType: "theoretical",
      date: fourDaysLaterStr,
      startTime: "14:00",
      endTime: "16:00",
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-9",
      userId: "1",
      instructorId: "1",
      classType: "practical",
      date: fourDaysLaterStr,
      startTime: "16:00",
      endTime: "18:00",
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-10",
      userId: "2",
      instructorId: "2",
      classType: "theoretical",
      date: fiveDaysLaterStr,
      startTime: "08:00",
      endTime: "10:00",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-11",
      userId: "1",
      instructorId: "3",
      classType: "practical",
      date: oneWeekLaterStr,
      startTime: "10:00",
      endTime: "12:00",
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-12",
      userId: "2",
      instructorId: "4",
      classType: "theoretical",
      date: oneWeekLaterStr,
      startTime: "14:00",
      endTime: "16:00",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-13",
      userId: "1",
      instructorId: "1",
      classType: "practical",
      date: twoWeeksLaterStr,
      startTime: "16:00",
      endTime: "18:00",
      createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-14",
      userId: "2",
      instructorId: "2",
      classType: "theoretical",
      date: lastWeekStr,
      startTime: "08:00",
      endTime: "10:00",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-15",
      userId: "1",
      instructorId: "3",
      classType: "practical",
      date: yesterdayStr,
      startTime: "10:00",
      endTime: "12:00",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "cancelled",
    },
    {
      id: "sample-16",
      userId: "2",
      instructorId: "4",
      classType: "theoretical",
      date: dayAfterStr,
      startTime: "08:00",
      endTime: "10:00",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-17",
      userId: "1",
      instructorId: "1",
      classType: "practical",
      date: threeDaysLaterStr,
      startTime: "12:00",
      endTime: "14:00",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-18",
      userId: "2",
      instructorId: "2",
      classType: "theoretical",
      date: fiveDaysLaterStr,
      startTime: "12:00",
      endTime: "14:00",
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-19",
      userId: "3",
      instructorId: "3",
      classType: "practical",
      date: tomorrowStr,
      startTime: "12:00",
      endTime: "14:00",
      createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-20",
      userId: "4",
      instructorId: "4",
      classType: "theoretical",
      date: dayAfterStr,
      startTime: "10:00",
      endTime: "12:00",
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-21",
      userId: "5",
      instructorId: "1",
      classType: "practical",
      date: threeDaysLaterStr,
      startTime: "08:00",
      endTime: "10:00",
      createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-22",
      userId: "3",
      instructorId: "2",
      classType: "theoretical",
      date: fourDaysLaterStr,
      startTime: "10:00",
      endTime: "12:00",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-23",
      userId: "4",
      instructorId: "3",
      classType: "practical",
      date: fiveDaysLaterStr,
      startTime: "14:00",
      endTime: "16:00",
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-24",
      userId: "5",
      instructorId: "4",
      classType: "theoretical",
      date: oneWeekLaterStr,
      startTime: "08:00",
      endTime: "10:00",
      createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-25",
      userId: "3",
      instructorId: "1",
      classType: "practical",
      date: oneWeekLaterStr,
      startTime: "16:00",
      endTime: "18:00",
      createdAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-26",
      userId: "4",
      instructorId: "2",
      classType: "theoretical",
      date: twoWeeksLaterStr,
      startTime: "10:00",
      endTime: "12:00",
      createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    },
    {
      id: "sample-27",
      userId: "5",
      instructorId: "3",
      classType: "practical",
      date: lastWeekStr,
      startTime: "14:00",
      endTime: "16:00",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "cancelled",
    },
  ];
  
  saveBookings(sampleBookings);
  return sampleBookings;
}

// Get all bookings from localStorage
export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem("driving-school-bookings");
  if (!stored) {
    // Initialize with sample bookings if none exist
    return initializeSampleBookings();
  }
  
  try {
    const bookings = JSON.parse(stored);
    // If empty array, initialize with sample bookings
    if (Array.isArray(bookings) && bookings.length === 0) {
      return initializeSampleBookings();
    }
    return bookings;
  } catch {
    return initializeSampleBookings();
  }
}

// Save bookings to localStorage
export function saveBookings(bookings: Booking[]): void {
  if (typeof window === "undefined") return;
  
  localStorage.setItem("driving-school-bookings", JSON.stringify(bookings));
}

// Add a new booking
export function addBooking(booking: Booking): void {
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
}

// Get bookings for a specific user
export function getUserBookings(userId: string): Booking[] {
  return getBookings().filter(
    (booking) => booking.userId === userId && booking.status === "confirmed"
  );
}

// Get bookings for a specific instructor and date
export function getInstructorBookings(
  instructorId: string,
  date: string
): Booking[] {
  return getBookings().filter(
    (booking) =>
      booking.instructorId === instructorId &&
      booking.date === date &&
      booking.status === "confirmed"
  );
}

// Get all bookings with enriched user and instructor data
export interface BookingWithDetails extends Booking {
  studentName: string;
  studentLegalId: string;
  instructorName: string;
}

export function getAllBookingsWithDetails(): BookingWithDetails[] {
  const bookings = getBookings();
  const users = getMockUsers();
  
  return bookings.map((booking) => {
    const user = users.find((u) => u.id === booking.userId);
    const instructor = MOCK_INSTRUCTORS.find((i) => i.id === booking.instructorId);
    
    return {
      ...booking,
      studentName: user?.name || "Usuario desconocido",
      studentLegalId: user?.legalId || "N/A",
      instructorName: instructor?.name || "Instructor desconocido",
    };
  });
}

// Mock users (shared with auth.ts logic)
const MOCK_USERS_DATA: User[] = [
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
  {
    id: "3",
    username: "student3",
    email: "student3@example.com",
    name: "Carlos Rodriguez",
    legalId: "11223344C",
    role: "student",
  },
  {
    id: "4",
    username: "student4",
    email: "student4@example.com",
    name: "Laura Martinez",
    legalId: "55667788D",
    role: "student",
  },
  {
    id: "5",
    username: "student5",
    email: "student5@example.com",
    name: "Juan Perez",
    legalId: "99887766E",
    role: "student",
  },
];

// Get mock users (for admin panel)
function getMockUsers(): User[] {
  // This would normally come from an API, but for MVP we'll use localStorage
  // and combine with the hardcoded mock users
  const storedUsers: User[] = [];
  const seenUserIds = new Set<string>();
  
  if (typeof window !== "undefined") {
    // Get bookings to find all user IDs
    const bookings = getBookings();
    const userIds = [...new Set(bookings.map((b) => b.userId))];
    
    // Try to get users from localStorage
    // Check the main user storage
    const currentUser = localStorage.getItem("driving-school-user");
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        if (!seenUserIds.has(user.id)) {
          storedUsers.push(user);
          seenUserIds.add(user.id);
        }
      } catch {
        // Ignore parse errors
      }
    }
    
    // Check for users stored with booking-specific keys
    userIds.forEach((userId) => {
      if (seenUserIds.has(userId)) return;
      
      // Try to find user in stored users or create a fallback
      const foundUser = storedUsers.find((u) => u.id === userId);
      if (!foundUser) {
        // Create a fallback user for bookings without user data
        storedUsers.push({
          id: userId,
          username: `user-${userId}`,
          email: `user${userId}@example.com`,
          name: `Usuario ${userId}`,
          legalId: `${Math.floor(Math.random() * 90000000) + 10000000}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          role: "student",
        });
        seenUserIds.add(userId);
      }
    });
  }
  
  // Combine with hardcoded users, avoiding duplicates
  const allUsers = [...MOCK_USERS_DATA];
  MOCK_USERS_DATA.forEach((u) => seenUserIds.add(u.id));
  
  storedUsers.forEach((user) => {
    if (!seenUserIds.has(user.id)) {
      allUsers.push(user);
      seenUserIds.add(user.id);
    }
  });
  
  return allUsers;
}

// Instructor Schedule Management
const SCHEDULE_STORAGE_KEY = "driving-school-instructor-schedules";

export interface InstructorSchedule {
  instructorId: string;
  date: string;
  slots: TimeSlot[];
}

// Get instructor schedule for a specific date
export function getInstructorSchedule(
  instructorId: string,
  date: string
): TimeSlot[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(SCHEDULE_STORAGE_KEY);
  if (!stored) return [];

  try {
    const schedules: InstructorSchedule[] = JSON.parse(stored);
    const schedule = schedules.find(
      (s) => s.instructorId === instructorId && s.date === date
    );
    return schedule ? schedule.slots : [];
  } catch {
    return [];
  }
}

// Save instructor schedule for a specific date
export function saveInstructorSchedule(
  instructorId: string,
  date: string,
  slots: TimeSlot[]
): void {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(SCHEDULE_STORAGE_KEY);
  let schedules: InstructorSchedule[] = [];

  if (stored) {
    try {
      schedules = JSON.parse(stored);
    } catch {
      schedules = [];
    }
  }

  // Remove existing schedule for this instructor and date
  schedules = schedules.filter(
    (s) => !(s.instructorId === instructorId && s.date === date)
  );

  // Add new schedule
  schedules.push({
    instructorId,
    date,
    slots,
  });

  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
}

// Get all schedules for an instructor
export function getAllInstructorSchedules(
  instructorId: string
): InstructorSchedule[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(SCHEDULE_STORAGE_KEY);
  if (!stored) return [];

  try {
    const schedules: InstructorSchedule[] = JSON.parse(stored);
    return schedules.filter((s) => s.instructorId === instructorId);
  } catch {
    return [];
  }
}
