"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/auth";
import { MOCK_INSTRUCTORS } from "@/lib/mockData";
import {
  createBooking,
  addBooking,
  getBookings,
  simulateApiDelay,
  isSlotAvailable,
} from "@/lib/mockData";
import { DailyCalendar } from "@/components/calendar/DailyCalendar";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type { User, Instructor, TimeSlot, ClassType, Booking } from "@/lib/types";
import { LogOut, User as UserIcon } from "lucide-react";

export default function CalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  // Initialize with tomorrow's date
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };
  const [selectedDate, setSelectedDate] = useState(getTomorrow());
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(
    null
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setIsLoading(false);

    // Load bookings
    const loadedBookings = getBookings();
    setBookings(loadedBookings);
  }, [router]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (!selectedInstructor) {
      toast.error("Por favor selecciona un instructor primero");
      return;
    }

    // Check if slot is still available
    const dateString = selectedDate.toISOString().split("T")[0];
    const available = isSlotAvailable(
      dateString,
      slot.startTime,
      selectedInstructor.id,
      bookings
    );

    if (!available) {
      toast.error("Este horario ya no está disponible");
      return;
    }

    setSelectedSlot(slot);
    setIsBookingDialogOpen(true);
  };

  const handleBookingConfirm = async (
    slot: TimeSlot,
    instructor: Instructor,
    classType: ClassType
  ) => {
    if (!user) return;

    // Double-check availability
    const dateString = slot.date;
    const available = isSlotAvailable(
      dateString,
      slot.startTime,
      instructor.id,
      bookings
    );

    if (!available) {
      toast.error("Este horario ya no está disponible");
      throw new Error("Slot unavailable");
    }

    // Simulate API call
    await simulateApiDelay(800);

    // Create and save booking
    const booking = createBooking(
      user.id,
      instructor.id,
      classType,
      slot.date,
      slot.startTime,
      slot.endTime
    );

    addBooking(booking);

    // Update local state
    const updatedBookings = getBookings();
    setBookings(updatedBookings);

    toast.success("¡Clase reservada exitosamente!");

    // Redirect to confirmation page
    router.push(`/confirmation?id=${booking.id}`);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
    toast.info("Sesión cerrada exitosamente");
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Programa Tus Clases</h1>
            <p className="text-muted-foreground">
              Reserva clases teóricas o prácticas de manejo
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="h-4 w-4" />
              <span>{user.name}</span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Instructor Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Instructor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Select
                value={selectedInstructor?.id || ""}
                onValueChange={(value) => {
                  const instructor = MOCK_INSTRUCTORS.find((i) => i.id === value);
                  setSelectedInstructor(instructor || null);
                }}
              >
                <SelectTrigger id="instructor" className="w-full md:w-[300px]">
                  <SelectValue placeholder="Selecciona un instructor" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_INSTRUCTORS.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <DailyCalendar
          selectedDate={selectedDate}
          selectedInstructor={selectedInstructor}
          onDateChange={setSelectedDate}
          onSlotClick={handleSlotClick}
          bookings={bookings}
        />

        {/* Booking Dialog */}
        <BookingDialog
          open={isBookingDialogOpen}
          onOpenChange={setIsBookingDialogOpen}
          slot={selectedSlot}
          instructor={selectedInstructor}
          instructors={MOCK_INSTRUCTORS}
          onConfirm={handleBookingConfirm}
        />

        {/* Info Alert */}
        {selectedInstructor && (
          <Alert>
            <AlertDescription>
              Haz clic en un horario verde para reservar una clase. Los horarios rojos están
              no disponibles y los grises ya están reservados.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
