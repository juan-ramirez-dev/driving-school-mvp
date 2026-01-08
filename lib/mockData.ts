import type { Instructor, Booking, TimeSlot, ClassType } from "./types";

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

// Get all bookings from localStorage
export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem("driving-school-bookings");
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
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
